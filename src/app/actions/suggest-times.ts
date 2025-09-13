
'use server';
import { suggestOptimalTimes, TimeSuggestionInput } from '@/ai/flows/calendar-time-suggestion';

export async function getSuggestions(input: TimeSuggestionInput) {
  try {
    const result = await suggestOptimalTimes(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get suggestions. Please try again later.' };
  }
}
