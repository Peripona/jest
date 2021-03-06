/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

import EventEmitter from 'events';
import ProjectWorkspace from '../project_workspace';
import Settings from '../Settings';

describe('Settings', () => {
  it('sets itself up fom the constructor', () => {
    const workspace = new ProjectWorkspace(
      'root_path',
      'path_to_jest',
      'test',
      1000,
    );
    const options = {shell: true};
    const settings = new Settings(workspace, options);
    expect(settings.workspace).toEqual(workspace);
    expect(settings.settings).toEqual(expect.any(Object));
    expect(settings.spawnOptions).toEqual(options);
  });

  it('[jest 20] reads and parses the config', () => {
    const workspace = new ProjectWorkspace(
      'root_path',
      'path_to_jest',
      'test',
      1000,
    );
    const completed = jest.fn();
    const config = {cacheDirectory: '/tmp/jest', name: '[md5 hash]'};
    const json = {
      config,
      version: '19.0.0',
    };

    const mockProcess: any = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    const createProcess = () => mockProcess;
    const buffer = makeBuffer(JSON.stringify(json));
    const settings = new Settings(workspace, {createProcess});

    settings.getConfig(completed);
    settings.getConfigProcess.stdout.emit('data', buffer);
    settings.getConfigProcess.emit('close');

    expect(completed).toHaveBeenCalled();
    expect(settings.jestVersionMajor).toBe(19);
    expect(settings.settings).toEqual(config);
  });

  it('[jest 21] reads and parses the config', () => {
    const workspace = new ProjectWorkspace(
      'root_path',
      'path_to_jest',
      'test',
      1000,
    );
    const completed = jest.fn();
    const configs = [{cacheDirectory: '/tmp/jest', name: '[md5 hash]'}];
    const json = {
      configs,
      version: '21.0.0',
    };

    const mockProcess: any = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    const createProcess = () => mockProcess;
    const buffer = makeBuffer(JSON.stringify(json));
    const settings = new Settings(workspace, {createProcess});

    settings.getConfig(completed);
    settings.getConfigProcess.stdout.emit('data', buffer);
    settings.getConfigProcess.emit('close');

    expect(completed).toHaveBeenCalled();
    expect(settings.jestVersionMajor).toBe(21);
    expect(settings.settings).toEqual(configs[0]);
  });

  it('[jest 21] reads and parses the configs', () => {
    const workspace = new ProjectWorkspace(
      'root_path',
      'path_to_jest',
      'test',
      1000,
    );
    const completed = jest.fn();
    const configs = [{cacheDirectory: '/tmp/jest', name: '[md5 hash]'}];
    const json = {
      configs,
      version: '21.0.0',
    };

    const mockProcess: any = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    const createProcess = () => mockProcess;
    const buffer = makeBuffer(JSON.stringify(json));
    const settings = new Settings(workspace, {createProcess});

    settings.getConfigs(completed);
    settings.getConfigProcess.stdout.emit('data', buffer);
    settings.getConfigProcess.emit('close');

    expect(completed).toHaveBeenCalled();
    expect(settings.jestVersionMajor).toBe(21);
    expect(settings.configs).toEqual(configs);
  });

  it('calls callback even if no data is sent', () => {
    const workspace = new ProjectWorkspace(
      'root_path',
      'path_to_jest',
      'test',
      1000,
    );
    const completed = jest.fn();

    const mockProcess: any = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    const createProcess = () => mockProcess;
    const settings = new Settings(workspace, {createProcess});

    settings.getConfig(completed);
    settings.getConfigProcess.emit('close');

    expect(completed).toHaveBeenCalled();
  });

  it('passes command, args, and options to createProcess', () => {
    const localJestMajorVersion = 1000;
    const pathToConfig = 'test';
    const pathToJest = 'path_to_jest';
    const rootPath = 'root_path';

    const workspace = new ProjectWorkspace(
      rootPath,
      pathToJest,
      pathToConfig,
      localJestMajorVersion,
    );
    const createProcess = jest.fn().mockReturnValue({
      on: () => {},
      stdout: new EventEmitter(),
    });
    const spawnOptions = {shell: true};
    const options: any = Object.assign({}, createProcess, spawnOptions);
    const settings = new Settings(workspace, options);
    settings.getConfig(() => {});

    expect(createProcess).toBeCalledWith(
      {
        localJestMajorVersion,
        pathToConfig,
        pathToJest,
        rootPath,
      },
      ['--showConfig'],
      spawnOptions,
    );
  });
});

const makeBuffer = (content: string) => {
  // Buffer.from is not supported in < Node 5.10
  if (typeof Buffer.from === 'function') {
    return Buffer.from(content);
  }

  return new Buffer(content);
};
