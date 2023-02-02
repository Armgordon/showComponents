import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clear } from '@store/modals';
import type { ModalWindowState } from '@components/common/customHooks';
import { useModalState } from '@components/common/customHooks';
import {
  getAnalyticsTypeArg,
  getCallbackAction,
  getChargingUnitArg,
  getIdArg,
  getModalComplexArg,
  getResourceIdArg,
  getResourceTypeArg,
  getStringArg,
  getTableSettingsArg,
} from '@components/common/ModalManager/utils';
import WidgetRemoveModal from '@components/analyticsChart/WidgetRemoveModal';

import type { ModalContextHandler, ModalNodeState, UseRenderModalsResult } from './types';
import { ModalNames } from './types';

const DashboardCreateModal = React.lazy(() => import('@components/analyticsChart/DashboardCreateModal'));
const DashboardRemoveModal = React.lazy(() => import('@components/analyticsChart/DashboardRemoveModal'));
const WidgetConstructModal = React.lazy(() => import('@components/analyticsChart/WidgetConstructModal'));
const WidgetMaximizeModal = React.lazy(() => import('@components/analyticsChart/WidgetMaximizeModal'));
const WidgetTableDataModal = React.lazy(() => import('@components/analyticsChart/WidgetTableDataModal'));
const WidgetTemplateConfigModal = React.lazy(
  () => import('@components/analyticsChart/SingleDashboardPage/WidgetTemplateConfigModal'),
);
const DashboardChangePeriodModal = React.lazy(() => import('@components/analyticsChart/DashboardChangePeriodModal'));
const NotificationModal = React.lazy(() => import('@components/common/NotificationModal'));
const ReportConstructModal = React.lazy(() => import('@components/analyticsTable/ReportConstructModal'));
const ReportRemoveModal = React.lazy(() => import('@components/analyticsTable/ReportRemoveModal'));
const ProviderAccessModal = React.lazy(() => import('@components/serviceDiscovery/ProviderAccessModal'));
const ProviderRemoveModal = React.lazy(() => import('@components/serviceDiscovery/ProviderRemoveModal'));
const ProviderEditModal = React.lazy(() => import('@components/serviceDiscovery/ProviderEditModal'));
const FolderEditorModal = React.lazy(() => import('@components/serviceDiscovery/ProviderPage/FolderEditorModal'));
const FolderRemoveModal = React.lazy(() => import('@components/serviceDiscovery/ProviderPage/FolderRemoveModal'));
const ResourceRemoveModal = React.lazy(() => import('@components/serviceDiscovery/ProviderPage/ResourceRemoveModal'));
const ChargingUnitCreateModal = React.lazy(
  () => import('@components/serviceDiscovery/BillingPage/ChargingUnitCreateModal'),
);
const ChargingUnitRemoveModal = React.lazy(
  () => import('@components/serviceDiscovery/BillingPage/ChargingUnitRemoveModal'),
);
const UserCreateModal = React.lazy(() => import('@components/users/UserCreateModal'));
const UserRemoveModal = React.lazy(() => import('@components/users/UserRemoveModal'));
const NoticeModal = React.lazy(() => import('@components/common/NoticeModal'));
const RoleCreateModal = React.lazy(() => import('@components/roles/RoleCreateModal'));
const ReportEditNameModal = React.lazy(() => import('@components/analyticsTable/ReportEditNameModal'));
const ReportChangePeriodModal = React.lazy(() => import('@components/analyticsTable/ReportChangePeriodModal'));
const RoleRemoveModal = React.lazy(() => import('@components/roles/RoleRemoveModal'));
const UsersPermissionsModal = React.lazy(() => import('@components/common/UsersPermissionsModal'));
const TableSettingsModal = React.lazy(() => import('@components/common/TableSettingsModal'));
const ChangeMyPasswordModal = React.lazy(() => import('@components/routing/ChangeMyPasswordModal'));
const CategoryCreateModal = React.lazy(() => import('@components/serviceDiscovery/Categories/CategoryCreateModal'));
const CategoriesListModal = React.lazy(() => import('@components/serviceDiscovery/Categories/CategoryListModal'));
const CategorySubCreateModal = React.lazy(
  () => import('@components/serviceDiscovery/Categories/CategorySubCreateModal'),
);
const CategoryAddObjectsModal = React.lazy(
  () => import('@components/serviceDiscovery/Categories/CategoryAddObjectsModal'),
);

/** Creation of modal context manager */
export const ModalContext = React.createContext<ModalContextHandler | null>(null);

/** Hook perfroms an action when detects browser navigation
 * @param onNavigationCallback - the callback which will be performed on browser navigation
 */
const useOnNavigation = (onNavigationCallback: () => void): void => {
  const history = useHistory();

  useEffect(() => {
    history.listen(() => onNavigationCallback());
  }, [history, onNavigationCallback]);
};

/** Hook which due to modal name and state modal window elements and it's state
 * @param modalName Name of created modal window
 * @param modalState Modal state (see {@link ModalWindowState} for further information)
 * @return {@link ModalNodeState} for each individual modal
 * */
const useModalNode = (modalName: ModalNames, modalState: ModalWindowState): React.ReactNode => {
  const { isOpen, currentId, onClose, arg, currentStep, setCurrentStep } = modalState;

  useOnNavigation(onClose);

  switch (modalName) {
    case ModalNames.DASHBOARD_CREATE_MODAL:
      return <DashboardCreateModal isOpen={isOpen} dashboardId={currentId} onClose={onClose} />;
    case ModalNames.DASHBOARD_REMOVE_MODAL:
      return <DashboardRemoveModal dashboardId={currentId} onClose={onClose} />;
    case ModalNames.WIDGET_CONSTRUCT_MODAL: {
      return (
        <WidgetConstructModal
          widgetId={currentId}
          isOpen={isOpen}
          onClose={onClose}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          position_in_dashboard={getIdArg(arg)}
        />
      );
    }
    case ModalNames.WIDGET_MAXIMIZE_MODAL:
      return <WidgetMaximizeModal isOpen={isOpen} widgetId={currentId} onClose={onClose} />;
    case ModalNames.WIDGET_TABLE_DATA_MODAL:
      return <WidgetTableDataModal widgetId={currentId} isOpen={isOpen} onClose={onClose} />;
    case ModalNames.WIDGET_REMOVE_MODAL:
      return <WidgetRemoveModal widgetId={currentId} isOpen={isOpen} onClose={onClose} />;
    case ModalNames.WIDGET_TEMPLATE_CONFIG_MODAL:
      return <WidgetTemplateConfigModal isOpen={isOpen} onClose={onClose} />;
    case ModalNames.DASHBOARD_CHANGE_PERIOD_MODAL:
      return <DashboardChangePeriodModal dashboardId={currentId} onClose={onClose} />;
    case ModalNames.NOTIFICATION_MODAL:
      return (
        <NotificationModal itemId={currentId} itemType={getAnalyticsTypeArg(arg)} isOpen={isOpen} onClose={onClose} />
      );
    case ModalNames.REPORT_CONSTRUCT_MODAL: {
      return (
        <ReportConstructModal
          isOpen={isOpen}
          onClose={onClose}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      );
    }
    case ModalNames.REPORT_EDIT_NAME_MODAL:
      return <ReportEditNameModal isOpen={isOpen} onClose={onClose} reportId={currentId} />;
    case ModalNames.REPORT_REMOVE_MODAL:
      return <ReportRemoveModal reportId={currentId} onClose={onClose} />;
    case ModalNames.USERS_PERMISSIONS_MODAL:
      return (
        <UsersPermissionsModal itemId={currentId} type={getAnalyticsTypeArg(arg)} onClose={onClose} isOpen={isOpen} />
      );
    case ModalNames.REPORT_CHANGE_PERIOD_MODAL:
      return <ReportChangePeriodModal onClose={onClose} reportId={currentId} />;
    case ModalNames.PROVIDER_ACCESS_MODAL:
      return <ProviderAccessModal providerId={currentId} onClose={onClose} />;
    case ModalNames.PROVIDER_EDITOR_MODAL:
      return <ProviderEditModal isOpen={isOpen} providerId={currentId} onClose={onClose} />;
    case ModalNames.PROVIDER_REMOVE_MODAL:
      return <ProviderRemoveModal providerId={currentId} onClose={onClose} />;
    case ModalNames.FOLDER_EDITOR_MODAL:
      return (
        <FolderEditorModal folderId={currentId} isOpen={isOpen} parentFolderId={getIdArg(arg)} onClose={onClose} />
      );
    case ModalNames.FOLDER_REMOVE_MODAL: {
      return (
        <FolderRemoveModal
          folderId={currentId}
          isOpen={isOpen}
          onAfterRemove={getCallbackAction(arg)}
          onClose={onClose}
        />
      );
    }
    case ModalNames.RESOURCE_REMOVE_MODAL: {
      const { secondArg, thirdArg, callbackArg } = getModalComplexArg(arg);

      return (
        <ResourceRemoveModal
          resourceId={getResourceIdArg(secondArg)}
          resourceType={getResourceTypeArg(thirdArg)}
          folderId={currentId}
          isOpen={isOpen}
          onClose={onClose}
          onAfterRemove={getCallbackAction(callbackArg)}
        />
      );
    }
    case ModalNames.CHARGING_UNIT_CREATE_MODAL:
      return <ChargingUnitCreateModal type={getChargingUnitArg(arg)} isOpen={isOpen} onClose={onClose} />;
    case ModalNames.CHARGING_UNIT_REMOVE_MODAL:
      return (
        <ChargingUnitRemoveModal id={currentId} type={getChargingUnitArg(arg)} isOpen={isOpen} onClose={onClose} />
      );
    case ModalNames.USER_CREATE_MODAL:
      return <UserCreateModal userId={currentId} isOpen={isOpen} onClose={onClose} />;
    case ModalNames.USER_REMOVE_MODAL:
      return <UserRemoveModal userId={currentId} isOpen={isOpen} onClose={onClose} />;
    case ModalNames.NOTICE_MODAL: {
      const { secondArg, thirdArg } = getModalComplexArg(arg);
      return (
        <NoticeModal
          title={getStringArg(secondArg)}
          noticeMessage={getStringArg(thirdArg)}
          isOpen={isOpen}
          onClose={onClose}
        />
      );
    }
    case ModalNames.USER_CHANGE_PASSWORD_MODAL:
      return <ChangeMyPasswordModal isOpen={isOpen} onClose={onClose} />;
    case ModalNames.TABLE_SETTINGS_MODAL:
      return <TableSettingsModal defaultValue={getTableSettingsArg(arg)} onClose={onClose} isOpen={isOpen} />;
    case ModalNames.ROLE_CREATE_MODAL:
      return <RoleCreateModal isOpen={isOpen} onClose={onClose} roleId={currentId} />;
    case ModalNames.ROLE_REMOVE_MODAL:
      return <RoleRemoveModal isOpen={isOpen} onClose={onClose} roleId={currentId} />;
    case ModalNames.CATEGORY_SUB_CREATE_MODAL:
      return (
        <CategorySubCreateModal
          parentCategoryId={currentId}
          categoryId={getIdArg(arg)}
          isOpen={isOpen}
          onClose={onClose}
        />
      );
    case ModalNames.CATEGORY_ADD_OBJECT_MODAL:
      return <CategoryAddObjectsModal isOpen={isOpen} onClose={onClose} categoryId={currentId} />;
    case ModalNames.CATEGORY_CREATE_MODAL:
      return <CategoryCreateModal isOpen={isOpen} onClose={onClose} categoryId={currentId} />;
    case ModalNames.CATEGORIES_LIST_MODAL:
      return <CategoriesListModal isOpen={isOpen} onClose={onClose} />;

    default:
      return null;
  }
};

/** Hook which create modal window elements and it's state
 * @param modalName Name of created modal window
 * @return {@link ModalNodeState} for each individual modal
 * */
const useCreateModal = (modalName: ModalNames): ModalNodeState => {
  const modalState = useModalState();
  const modalElement = useModalNode(modalName, modalState);

  return {
    node: modalState.isOpen && <React.Fragment key={modalName}>{modalElement}</React.Fragment>,
    name: modalName,
    handlers: modalState,
  };
};

/** Hook which form list of modals by create modal nodes with handlers
 * @return list of  {@link ModalNodeState}
 * @summary Duet to react hooks calling - find no another way to generate modals
 * */
export const useModalList = (): ModalNodeState[] => {
  const allModals: ModalNodeState[] = [];

  const dispatch = useDispatch();
  const clearModalsCache = useCallback(() => dispatch(clear()), [dispatch]);
  useOnNavigation(clearModalsCache);

  /** Analytics module modals */
  /* Dashboards */
  allModals.push(useCreateModal(ModalNames.DASHBOARD_CREATE_MODAL));
  allModals.push(useCreateModal(ModalNames.DASHBOARD_REMOVE_MODAL));
  allModals.push(useCreateModal(ModalNames.DASHBOARD_CHANGE_PERIOD_MODAL));
  allModals.push(useCreateModal(ModalNames.WIDGET_CONSTRUCT_MODAL));
  allModals.push(useCreateModal(ModalNames.WIDGET_MAXIMIZE_MODAL));
  allModals.push(useCreateModal(ModalNames.WIDGET_TABLE_DATA_MODAL));
  allModals.push(useCreateModal(ModalNames.WIDGET_TEMPLATE_CONFIG_MODAL));
  allModals.push(useCreateModal(ModalNames.WIDGET_REMOVE_MODAL));

  /* Table Reports */
  allModals.push(useCreateModal(ModalNames.REPORT_CONSTRUCT_MODAL));
  allModals.push(useCreateModal(ModalNames.REPORT_EDIT_NAME_MODAL));
  allModals.push(useCreateModal(ModalNames.REPORT_REMOVE_MODAL));
  allModals.push(useCreateModal(ModalNames.REPORT_CHANGE_PERIOD_MODAL));

  /* Notifications */
  allModals.push(useCreateModal(ModalNames.NOTIFICATION_MODAL));

  /** SD module  modals */
  /* Provider */
  allModals.push(useCreateModal(ModalNames.PROVIDER_ACCESS_MODAL));
  allModals.push(useCreateModal(ModalNames.PROVIDER_EDITOR_MODAL));
  allModals.push(useCreateModal(ModalNames.PROVIDER_REMOVE_MODAL));
  allModals.push(useCreateModal(ModalNames.FOLDER_EDITOR_MODAL));
  allModals.push(useCreateModal(ModalNames.FOLDER_REMOVE_MODAL));
  allModals.push(useCreateModal(ModalNames.RESOURCE_REMOVE_MODAL));

  /* Billing */
  allModals.push(useCreateModal(ModalNames.CHARGING_UNIT_CREATE_MODAL));
  allModals.push(useCreateModal(ModalNames.CHARGING_UNIT_REMOVE_MODAL));

  /* Categories */
  allModals.push(useCreateModal(ModalNames.CATEGORY_SUB_CREATE_MODAL));
  allModals.push(useCreateModal(ModalNames.CATEGORY_ADD_OBJECT_MODAL));
  allModals.push(useCreateModal(ModalNames.CATEGORY_CREATE_MODAL));
  allModals.push(useCreateModal(ModalNames.CATEGORIES_LIST_MODAL));

  /** Users module modals */
  allModals.push(useCreateModal(ModalNames.USER_CREATE_MODAL));
  allModals.push(useCreateModal(ModalNames.USER_REMOVE_MODAL));
  allModals.push(useCreateModal(ModalNames.USER_CHANGE_PASSWORD_MODAL));

  /** Roles module modals */
  allModals.push(useCreateModal(ModalNames.ROLE_CREATE_MODAL));
  allModals.push(useCreateModal(ModalNames.ROLE_REMOVE_MODAL));

  /** Common modals */
  allModals.push(useCreateModal(ModalNames.NOTICE_MODAL));
  allModals.push(useCreateModal(ModalNames.TABLE_SETTINGS_MODAL));
  allModals.push(useCreateModal(ModalNames.USERS_PERMISSIONS_MODAL));

  return allModals;
};

/** Hook which create all project usable modals and context to interaction with it
 * @return look {@link UseRenderModalsResult}
 * */
export const useRenderModals = (): UseRenderModalsResult => {
  const modalList = useModalList();

  const modalContextValue = modalList.reduce((acc, currentModal) => {
    acc[currentModal.name] = currentModal.handlers;
    return acc;
  }, {} as ModalContextHandler);

  const modals = modalList.map((item) => item.node);

  return {
    modalContextValue,
    modals,
  };
};
