import type { FC } from 'react';
import React from 'react';
import { componentDisplayName } from '@components/common/utils';
import Preloader from '@components/common/Preloader';
import ModalOverlay from '@components/common/ModalOverlay';
import AsyncLoadWrapper from '@components/common/AsyncLoadWrapper';
import { Size } from '@components/common/Preloader/types';

import { ModalContext, useRenderModals } from './behavior';
import type { Props } from './types';

const Component: FC<Props> = ({ children }) => {
  const { modalContextValue, modals } = useRenderModals();
  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
      <AsyncLoadWrapper
        suspenseFallback={
          <ModalOverlay>
            <Preloader size={Size.LARGE} />
          </ModalOverlay>
        }
      >
        {modals.map((item) => item)}
      </AsyncLoadWrapper>
    </ModalContext.Provider>
  );
};

Component.displayName = componentDisplayName('ModalManager', __filename);

export default Component;
