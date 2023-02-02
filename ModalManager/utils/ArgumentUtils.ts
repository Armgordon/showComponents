import { ProviderChargingUnitType, ProviderResourceType, AnalyticsType } from '@domain';
import type { ResourceId, TableColumnsSettings } from '@domain';
import { isProviderResourceType } from '@components/common/utils';
import { isChargingUnitType } from '@utils/guards/ChargingUnits';
import { BLANK_SETTINGS_DEFAULT } from '@domain/tablesSettings/defaultValues';
import type { ModalComplexArg } from '@components/common/ModalManager/types';
import { isResourceId } from '@utils/guards/ProviderFileSystem';
import { isAnalyticsType } from '@utils/guards';

/** Internal modal manager guard to check type of argument on open modals */
export const isModalComplexArg = (value?: unknown): value is ModalComplexArg =>
  !!value && !!(value as ModalComplexArg)?.secondArg;

/**
 * Check that type of value is `string`
 * @param [value] Value to check
 * @returns [value] If type of value is `string` returns it or `null`
 */
export const getStringArg = (value?: unknown): string => (typeof value === 'string' ? value : '');

/**
 * Check that type of value is `number`
 * @param [value] Value to check
 * @returns [value] If type of value is `number` returns it or `null`
 */
export const getIdArg = (value?: unknown): number | null => (typeof value === 'number' ? value : null);

/**
 * Check that type of value is {@link ProviderResourceType} enumeration value
 * and returns it or `{@link ProviderResourceType.NETWORK}`
 * @param [value] Value to check
 * @returns If value is valid {@link ProviderResourceType} enumeration value or {@link ProviderResourceType.NETWORK}
 */
export const getResourceTypeArg = (value?: unknown): ProviderResourceType =>
  isProviderResourceType(value) ? value : ProviderResourceType.NETWORK;

/**
 * Check that type of value is {@link ResourceId} enumeration value
 * and returns it or result from {@link getResourceTypeArg}
 * @param [value] Value to check
 * @returns If value is valid {@link ResourceId} enumeration value or {@link ProviderResourceType.NETWORK}
 */
export const getResourceIdArg = (value?: unknown): ResourceId =>
  isResourceId(value) ? value : getResourceTypeArg(value);

/**
 * Check that value is valid {@link ProviderChargingUnitType} enumeration value
 * and returns it or first chargingUnit type
 * @param [value] Value to check
 * @returns If value is valid {@link ProviderChargingUnitType} enumeration value or {@link ProviderChargingUnitType.CPU}
 */
export const getChargingUnitArg = (value?: unknown): ProviderChargingUnitType =>
  isChargingUnitType(value) ? value : ProviderChargingUnitType.CPU;

/**
 * Check that value is typed as {@link TableColumnsSettings} and returns it or Blank instance of type
 * @param [arg] Value to check
 * @returns [arg] if value type is {@link TableColumnsSettings}
 */
export const getTableSettingsArg = (arg?: unknown): TableColumnsSettings => {
  if (arg && (arg as TableColumnsSettings).toShow.length > 0 && (arg as TableColumnsSettings).names)
    return arg as TableColumnsSettings;
  return BLANK_SETTINGS_DEFAULT;
};

/**
 * Check that value  type is {@link ModalComplexArg}
 * @param [value] Value to check
 * @returns If value is {@link ModalComplexArg} returns it or blank ModalComplexArg
 */
export const getModalComplexArg = (value?: unknown): ModalComplexArg =>
  isModalComplexArg(value) ? value : ({} as ModalComplexArg);

/**
 * Check that value is typed as `callback`
 * @param [value] Value to check
 * @returns If value is `callback` returns it or `callback` which returns undefined
 */
export const getCallbackAction = (value?: unknown): (() => unknown) =>
  typeof value === 'function' ? (value as () => unknown) : () => undefined;

/**
 * Check that value is valid {@link AnalyticsType} enumeration value
 * and returns it or first AnalyticsType type
 * @param [value] Value to check
 * @returns If value is valid {@link AnalyticsType} enumeration value or {@link AnalyticsType.DASHBOARD}
 */
export const getAnalyticsTypeArg = (value?: unknown): AnalyticsType =>
  isAnalyticsType(value) ? value : AnalyticsType.DASHBOARD;
