// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { workspace } from 'vscode';
import { CancellationToken, PortAttributes, PortAttributesProvider, PortAutoForwardAction } from 'vscode';
import { IExtensionSyncActivationService } from '../platform/activation/types';
import { traceError } from '../platform/logging';
import { IDisposableRegistry } from '../platform/common/types';
import { UsedPorts } from './common/usedPorts';

/**
 * Used to determine how ports can be used when creating a raw kernel.
 */
@injectable()
export class PortAttributesProviders implements PortAttributesProvider, IExtensionSyncActivationService {
    constructor(@inject(IDisposableRegistry) private readonly disposables: IDisposableRegistry) {}
    activate(): void {
        try {
            this.disposables.push(workspace.registerPortAttributesProvider({}, this));
        } catch (ex) {
            // In case proposed API changes.
            traceError('Failure in registering port attributes', ex);
        }
    }
    providePortAttributes(
        port: number,
        _pid: number | undefined,
        _commandLine: string | undefined,
        _token: CancellationToken
    ): PortAttributes | undefined {
        try {
            if (UsedPorts.has(port)) {
                return new PortAttributes(port, PortAutoForwardAction.Ignore);
            }
        } catch (ex) {
            // In case proposed API changes.
            traceError('Failure in returning port attributes', ex);
        }
    }
}
