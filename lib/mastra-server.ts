import { mastra } from '@/src/mastra';

// Initialize mastra once for the entire application
let initialized = false;

export function getMastra() {
  if (!initialized) {
    // Disable telemetry warnings
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).___MASTRA_TELEMETRY___ = true;
    }
    initialized = true;
  }
  return mastra;
}

export function getResearchAgent() {
  const mastraInstance = getMastra();
  // Use the key name from the agents config, not the agent ID
  const agent = mastraInstance.getAgent('researchAgent');

  if (!agent) {
    throw new Error('Research agent not found in Mastra instance');
  }

  return agent;
}
