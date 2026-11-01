# Utsav: AI Celebration & Event Planner

GenAI-powered planning assistant for Indian weddings, birthdays, pujas and community events.
Built for **PromptWars Virtual, Challenge 05: Celebration & Event Planner**.

**Live app:** https://utsav-event-planner.ai.studio

## What it does
Enter event type, date, city, guest count and budget in INR. One click calls Gemini once and returns a complete plan:

- **INR budget breakdown** by category, with a safety contingency of 5-10%
- **Budget reality check**: warns when the budget per guest is unrealistically low and suggests a minimum
- **Reverse timeline** counted back from the event date; no milestone is ever in the past
- **Fast-track mode**: events under 3 months away get weekly sprints and URGENT task flags
- **Vendor checklist** with booking lead times and estimated market rates
- **5 personalized Indian traditions** with "how to bring this to life" tips
- City-specific cultural and logistics tips
- Instant Indian celebration templates (wedding and sangeet, haldi, Ganesh Utsav, 1st birthday, griha pravesh)
- Saved plans, copy and print/PDF, mobile-responsive layout, keyboard-friendly forms

## Tools used
- **Google AI Studio Build mode** to generate and iterate on the app
- **Gemini** for the planning engine (structured JSON output)
- Antigravity was tried first, but it was too heavy for my laptop, so I moved to AI Studio

## How prompts evolved
1. v1: base planner (inputs, budget, timeline, vendors, ideas)
2. v1b: Indian-context version for AI Studio Build
3. v2: fixed timeline showing past dates (today's date is now passed to Gemini)
4. v3: plan must use exactly the values typed in the form
5. v4: budget reality check per guest

## GenAI vs human design
- **GenAI:** code generation, UI, plan content
- **Human:** problem angle (Indian context), testing, spotting the past-date and wrong-city bugs, writing fix prompts, budget reality check idea

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and add your own Gemini API key
3. `npm run dev`

## Future scope
Budget sliders with auto-rebalance, calendar (.ics) export, Hinglish input.
