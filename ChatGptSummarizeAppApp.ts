import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
    IEnvironmentRead
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ChatGPTCommand } from './commands/ChatGPTCommand';

export class ChatGptSummarizeAppApp extends App {
    public appLogger: ILogger
    public infoId: string;
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.infoId = info.id;
        this.appLogger = this.getLogger()
        this.appLogger.debug(info.id)
        
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        configuration.slashCommands.provideSlashCommand(new ChatGPTCommand(this.appLogger)); // [2]
    }
    
}
