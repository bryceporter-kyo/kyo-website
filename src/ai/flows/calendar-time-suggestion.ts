'use server';

/**
 * @fileOverview Provides time suggestions for program schedules based on instructor availability.
 *
 * - suggestOptimalTimes - A function that suggests optimal times.
 * - TimeSuggestionInput - The input type for the suggestOptimalTimes function.
 * - TimeSuggestionOutput - The return type for the suggestOptimalTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimeSuggestionInputSchema = z.object({
  programName: z
    .string()
    .describe('The name of the program the user is registering for.'),
  instructorAvailability: z
    .string()
    .describe('The availability of the instructor for the program.'),
  userPreferences: z
    .string()
    .describe('The user preferences for the program schedule.'),
});

export type TimeSuggestionInput = z.infer<typeof TimeSuggestionInputSchema>;

const TimeSuggestionOutputSchema = z.object({
  suggestedTimes: z
    .string()
    .describe('Suggested times for the program based on instructor availability and user preferences.'),
});

export type TimeSuggestionOutput = z.infer<typeof TimeSuggestionOutputSchema>;

export async function suggestOptimalTimes(input: TimeSuggestionInput): Promise<TimeSuggestionOutput> {
  return suggestOptimalTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timeSuggestionPrompt',
  input: {schema: TimeSuggestionInputSchema},
  output: {schema: TimeSuggestionOutputSchema},
  prompt: `You are an AI assistant helping to suggest optimal times for a program schedule.

  Given the program name, instructor availability, and user preferences, suggest the best possible times for the program.

  Program Name: {{{programName}}}
  Instructor Availability: {{{instructorAvailability}}}
  User Preferences: {{{userPreferences}}}

  Suggested Times:`,
});

const suggestOptimalTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalTimesFlow',
    inputSchema: TimeSuggestionInputSchema,
    outputSchema: TimeSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
