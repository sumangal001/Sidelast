import { getDatabase } from './database';
import { clearProfile } from './profile';

export function clearAllLearnedData(): void {
  getDatabase().exec('DELETE FROM corrections');
  clearProfile();
}
