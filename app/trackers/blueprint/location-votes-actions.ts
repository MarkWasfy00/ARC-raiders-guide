'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { VoteCategory } from '@/lib/generated/prisma/client';

type VoteData = {
  locationName: string;
  category: VoteCategory;
  voteCount: number;
};

type BlueprintVotesResponse = {
  blueprintId: string;
  votes: VoteData[];
  userVotes: {
    locationName: string;
    category: VoteCategory;
  }[];
};

// Get user's IP address for anonymous tracking
async function getUserIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Vote for a blueprint location
 */
export async function voteForLocation(
  blueprintId: string,
  locationName: string,
  category: VoteCategory
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Voting for:', { blueprintId, locationName, category });
    const userIp = await getUserIp();
    console.log('User IP:', userIp);

    // Create vote (unique constraint will prevent duplicates)
    const vote = await prisma.blueprintLocationVote.create({
      data: {
        blueprintId,
        locationName,
        category,
        userIp,
      },
    });

    console.log('Vote created:', vote);
    return { success: true };
  } catch (error: any) {
    console.error('Error voting for location:', error);

    // If unique constraint violation, user already voted
    if (error.code === 'P2002') {
      console.log('User already voted for this location');
      return { success: true }; // Already voted, that's fine
    }

    return { success: false, error: error.message || 'Failed to save vote' };
  }
}

/**
 * Get all votes for a blueprint
 */
export async function getBlueprintVotes(blueprintId: string): Promise<BlueprintVotesResponse> {
  try {
    const userIp = await getUserIp();

    // Get all votes for this blueprint
    const votes = await prisma.blueprintLocationVote.groupBy({
      by: ['locationName', 'category'],
      where: {
        blueprintId,
      },
      _count: {
        id: true,
      },
    });

    // Get user's votes for this blueprint
    const userVotes = await prisma.blueprintLocationVote.findMany({
      where: {
        blueprintId,
        userIp,
      },
      select: {
        locationName: true,
        category: true,
      },
    });

    const voteData: VoteData[] = votes.map((vote) => ({
      locationName: vote.locationName,
      category: vote.category,
      voteCount: vote._count.id,
    }));

    return {
      blueprintId,
      votes: voteData,
      userVotes,
    };
  } catch (error) {
    console.error('Error fetching blueprint votes:', error);
    return {
      blueprintId,
      votes: [],
      userVotes: [],
    };
  }
}

/**
 * Get votes for all blueprints (for initial load)
 */
export async function getAllBlueprintVotes(): Promise<Record<string, BlueprintVotesResponse>> {
  try {
    const userIp = await getUserIp();

    // Get all votes
    const allVotes = await prisma.blueprintLocationVote.groupBy({
      by: ['blueprintId', 'locationName', 'category'],
      _count: {
        id: true,
      },
    });

    // Get all user votes
    const allUserVotes = await prisma.blueprintLocationVote.findMany({
      where: {
        userIp,
      },
      select: {
        blueprintId: true,
        locationName: true,
        category: true,
      },
    });

    // Organize by blueprint ID
    const result: Record<string, BlueprintVotesResponse> = {};

    allVotes.forEach((vote) => {
      if (!result[vote.blueprintId]) {
        result[vote.blueprintId] = {
          blueprintId: vote.blueprintId,
          votes: [],
          userVotes: [],
        };
      }

      result[vote.blueprintId].votes.push({
        locationName: vote.locationName,
        category: vote.category,
        voteCount: vote._count.id,
      });
    });

    // Add user votes
    allUserVotes.forEach((userVote) => {
      if (!result[userVote.blueprintId]) {
        result[userVote.blueprintId] = {
          blueprintId: userVote.blueprintId,
          votes: [],
          userVotes: [],
        };
      }

      result[userVote.blueprintId].userVotes.push({
        locationName: userVote.locationName,
        category: userVote.category,
      });
    });

    return result;
  } catch (error) {
    console.error('Error fetching all blueprint votes:', error);
    return {};
  }
}
