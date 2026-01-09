// Types
export type {
  LoadoutData,
  Loadout,
  ProfileData,
  LoadoutSlotConfig,
  ItemWithSlots,
  LoadoutSlotType,
  SlotSelection,
  CreateLoadoutInput,
  UpdateLoadoutInput,
  LoadoutFilters,
  LoadoutActionResponse,
} from './types';

// Utils
export {
  getBagCapacity,
  initializeSlots,
  resizeSlots,
  getItemIconUrl,
  validateLoadoutData,
  createEmptyLoadoutData,
  getRarityColor,
  getSlotDisplayName,
} from './utils/slot-utils';

// Components
export { LoadoutSlot } from './components/LoadoutSlot';
export { ItemSelectionDialog } from './components/ItemSelectionDialog';
export { LoadoutEditor } from './components/LoadoutEditor';
export { LoadoutCard } from './components/LoadoutCard';
export { LoadoutsList } from './components/LoadoutsList';
export { LoadoutView } from './components/LoadoutView';
export { LoadoutCreateForm } from './components/LoadoutCreateForm';
export { LoadoutEditForm } from './components/LoadoutEditForm';

// Services
export {
  createLoadout,
  updateLoadout,
  deleteLoadout,
  getLoadouts,
  getLoadout,
  getItem,
} from './services/loadouts-actions';
