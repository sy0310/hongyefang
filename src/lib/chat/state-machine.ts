export type { ParameterKey } from '@/types/assessment';
import type { ParameterKey } from '@/types/assessment';

export interface ConversationState {
  collected: Partial<Record<ParameterKey, number | string>>;
  currentParameter: ParameterKey | null;
  followUpRounds: Record<ParameterKey, number>;
  assessmentId: string | null;
  isComplete: boolean;
}

export type ConversationAction =
  | { type: 'START' }
  | { type: 'PARAMETER_COLLECTED'; key: ParameterKey; value: number | string }
  | { type: 'FOLLOW_UP_USED'; key: ParameterKey }
  | { type: 'SET_ASSESEMENT_ID'; id: string }
  | { type: 'COMPLETE' };

export const PARAMETER_ORDER: ParameterKey[] = [
  'targetIndustry',
  'annualCapital',
  'weeklyTime',
  'expectedReturn',
  'investmentAmount',
  'industryExperience',
  'debtPressure',
  'handsOffPreference',
  'setupAversion',
];

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        currentParameter: PARAMETER_ORDER[0],
      };

    case 'PARAMETER_COLLECTED': {
      const newCollected = { ...state.collected, [action.key]: action.value };
      const currentIndex = PARAMETER_ORDER.indexOf(action.key);
      const nextIndex = currentIndex + 1;
      const nextParameter = nextIndex < PARAMETER_ORDER.length
        ? PARAMETER_ORDER[nextIndex]
        : null;
      const isComplete = nextParameter === null && Object.keys(newCollected).length === PARAMETER_ORDER.length;

      return {
        ...state,
        collected: newCollected,
        currentParameter: nextParameter,
        followUpRounds: { ...state.followUpRounds, [action.key]: 0 },
        isComplete,
      };
    }

    case 'FOLLOW_UP_USED': {
      // CHAT-03 guard: reject if follow-up limit (1) already reached for this parameter
      const currentRounds = state.followUpRounds[action.key] || 0;
      if (currentRounds >= 1) {
        return state; // reject — follow-up limit reached
      }
      return {
        ...state,
        followUpRounds: {
          ...state.followUpRounds,
          [action.key]: currentRounds + 1,
        },
      };
    }

    case 'SET_ASSESEMENT_ID':
      return { ...state, assessmentId: action.id };

    case 'COMPLETE':
      return { ...state, isComplete: true };

    default:
      return state;
  }
}
