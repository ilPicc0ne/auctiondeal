/**
 * SHAB Data Processor Service
 * Handles processing and storing SHAB publications in the database
 * Includes duplicate detection and data validation
 */
import { getPrismaClient } from '@auctiondeal/shared-ts';
import { ShabApiService } from './shab-api.js';
import { ShabProcessingError } from '../types/shab.js';
export class ShabProcessorService {
    constructor() {
        this.shabApi = new ShabApiService();
        this.prisma = getPrismaClient();
        if (!this.prisma) {
            throw new Error('Failed to initialize database connection');
        }
    }
    /**
     * Process daily publications and store in database
     */
    async processDailyPublications() {
        console.log('🔄 Starting daily SHAB publication processing...');
        try {
            const publications = await this.shabApi.fetchDailyPublications();
            console.log(`📊 Found ${publications.length} publications for today`);
            return await this.processPublications(publications);
        }
        catch (error) {
            console.error('❌ Daily processing failed:', error);
            throw new ShabProcessingError(`Daily processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Process historical publications and store in database
     * @param daysBack Number of days to process (default: 90)
     */
    async processHistoricalPublications(daysBack = 90) {
        console.log(`🔄 Starting historical SHAB publication processing (${daysBack} days)...`);
        try {
            const publications = await this.shabApi.fetchHistoricalPublications(daysBack);
            console.log(`📊 Found ${publications.length} historical publications`);
            return await this.processPublications(publications);
        }
        catch (error) {
            console.error('❌ Historical processing failed:', error);
            throw new ShabProcessingError(`Historical processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Process a batch of publications
     * @param publications Array of SHAB publications to process
     */
    async processPublications(publications) {
        const result = {
            processed: 0,
            created: 0,
            skipped: 0,
            errors: 0,
            details: []
        };
        for (const publication of publications) {
            result.processed++;
            try {
                // Check if publication already exists
                const existing = await this.prisma.shabPublication.findUnique({
                    where: { id: publication.id }
                });
                if (existing) {
                    result.skipped++;
                    result.details.push({
                        publicationId: publication.id,
                        status: 'skipped',
                        message: 'Already exists'
                    });
                    continue;
                }
                // Process the publication
                await this.processSinglePublication(publication);
                result.created++;
                result.details.push({
                    publicationId: publication.id,
                    status: 'created'
                });
                console.log(`✅ Processed publication ${publication.id}`);
            }
            catch (error) {
                result.errors++;
                result.details.push({
                    publicationId: publication.id,
                    status: 'error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
                console.error(`❌ Failed to process publication ${publication.id}:`, error);
                // Continue processing other publications
            }
        }
        console.log(`📊 Processing complete: ${result.created} created, ${result.skipped} skipped, ${result.errors} errors`);
        return result;
    }
    /**
     * Process a single publication and create auctions
     * @param publication SHAB publication data
     */
    async processSinglePublication(publication) {
        // Start a database transaction
        await this.prisma.$transaction(async (tx) => {
            // Create the SHAB publication record
            const shabPublication = await tx.shabPublication.create({
                data: {
                    id: publication.id,
                    publishDate: new Date(publication.publishDate),
                    xmlContent: publication.xmlContent,
                    canton: publication.canton,
                    rubric: publication.rubric,
                    subRubric: publication.subRubric,
                    officialLanguage: publication.officialLanguage,
                    processingStatus: 'processing'
                }
            });
            // Parse XML content to extract auction information
            const parsedData = this.shabApi.parsePublicationXml(publication.xmlContent);
            // Create auction records
            for (const auctionData of parsedData.auctions) {
                const auction = await tx.auction.create({
                    data: {
                        shabPublicationId: shabPublication.id,
                        auctionDate: this.parseAuctionDate(auctionData.date) || new Date(),
                        auctionLocation: auctionData.location || 'Unknown',
                        status: 'published'
                    }
                });
                // Create auction objects
                for (const objectData of auctionData.objects) {
                    await tx.auctionObject.create({
                        data: {
                            auctionId: auction.id,
                            rawText: objectData.text,
                            objectOrder: objectData.order
                        }
                    });
                }
            }
            // Update processing status to completed
            await tx.shabPublication.update({
                where: { id: shabPublication.id },
                data: {
                    processingStatus: 'completed',
                    processedAt: new Date()
                }
            });
        });
    }
    /**
     * Parse auction date string to Date object
     * @param dateStr Date string in various Swiss formats
     */
    parseAuctionDate(dateStr) {
        if (!dateStr)
            return null;
        try {
            // Handle Swiss date formats like "15. März 2025" or "15.03.2025"
            const monthNames = {
                'januar': 0, 'jan': 0,
                'februar': 1, 'févr': 1, 'feb': 1,
                'märz': 2, 'mars': 2, 'mär': 2,
                'april': 3, 'avril': 3, 'apr': 3,
                'mai': 4,
                'juni': 5, 'juin': 5, 'jun': 5,
                'juli': 6, 'juillet': 6, 'jul': 6,
                'august': 7, 'août': 7, 'aug': 7,
                'september': 8, 'septembre': 8, 'sep': 8,
                'oktober': 9, 'octobre': 9, 'okt': 9,
                'november': 10, 'novembre': 10, 'nov': 10,
                'dezember': 11, 'décembre': 11, 'dez': 11
            };
            // Try DD.MM.YYYY format first
            const numericMatch = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
            if (numericMatch) {
                const [, day, month, year] = numericMatch;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            // Try DD. Month YYYY format
            const textMatch = dateStr.match(/(\d{1,2})\.\s*(\w+)\s*(\d{4})/);
            if (textMatch) {
                const [, day, monthStr, year] = textMatch;
                const monthName = monthStr.toLowerCase();
                const monthIndex = monthNames[monthName];
                if (monthIndex !== undefined) {
                    return new Date(parseInt(year), monthIndex, parseInt(day));
                }
            }
            // Fallback: try to parse as ISO date
            return new Date(dateStr);
        }
        catch (error) {
            console.warn(`Failed to parse date: ${dateStr}`, error);
            return null;
        }
    }
    /**
     * Get processing statistics
     */
    async getProcessingStats() {
        const [totalPubs, completedPubs, pendingPubs, totalAuctions, totalObjects, lastProcessed] = await Promise.all([
            this.prisma.shabPublication.count(),
            this.prisma.shabPublication.count({ where: { processingStatus: 'completed' } }),
            this.prisma.shabPublication.count({ where: { processingStatus: 'pending' } }),
            this.prisma.auction.count(),
            this.prisma.auctionObject.count(),
            this.prisma.shabPublication.findFirst({
                where: { processingStatus: 'completed' },
                orderBy: { processedAt: 'desc' },
                select: { processedAt: true }
            })
        ]);
        return {
            totalPublications: totalPubs,
            completedPublications: completedPubs,
            pendingPublications: pendingPubs,
            totalAuctions: totalAuctions,
            totalAuctionObjects: totalObjects,
            lastProcessed: lastProcessed?.processedAt || undefined
        };
    }
    /**
     * Clean up failed processing attempts
     */
    async cleanupFailedProcessing() {
        // Delete publications that failed to process completely
        const failedPublications = await this.prisma.shabPublication.findMany({
            where: {
                processingStatus: 'processing',
                createdAt: {
                    lt: new Date(Date.now() - 60 * 60 * 1000) // Older than 1 hour
                }
            }
        });
        let cleanedUp = 0;
        for (const pub of failedPublications) {
            try {
                await this.prisma.shabPublication.delete({
                    where: { id: pub.id }
                });
                cleanedUp++;
            }
            catch (error) {
                console.error(`Failed to cleanup publication ${pub.id}:`, error);
            }
        }
        console.log(`🧹 Cleaned up ${cleanedUp} failed processing attempts`);
        return cleanedUp;
    }
    /**
     * Close database connection
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
// Singleton instance for direct usage
export const shabProcessorService = new ShabProcessorService();
