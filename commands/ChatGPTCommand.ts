import {
    IHttp,
    IModify,
    IRead,
    ILogger,
    IHttpResponse,
    ILivechatRead
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

import { IMessage } from '@rocket.chat/apps-engine/definition/messages';


export class ChatGPTCommand implements ISlashCommand {
    public command = 'summarize'; // [1]
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;
    public appLogger: ILogger

    constructor(logger: ILogger){
        this.appLogger = logger;
        
    }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp): Promise<void> {
        const commands: string[] = this.extractCommand(context.getArguments());
        
        if (commands.length === 0) { 
            throw new Error('Error!');
        }

        const [subcommand, length] = commands;
                  
        // var query: string = await this.buildMessage(read, context.getRoom().id, subcommand, length);
        // CURRENTLY FETCHING MESSAGES IS NOT WORKING SO I AM USING 

        var query: string = this.tempMessage(subcommand, length);

        
        var response: string = await this.summarizeText(read, http, query);

        this.sendMessage(context, modify, response);

    }

    private extractCommand(args: string[]): string[]{

        if(!args){
            return []
        }
        
        if(args.length == 1){
            if(args[0] === "normal"){
                return ["Summarize the text below \n", ""];
            }
            else if(args[0] === "bullet"){
                return ["Summarize the text below as bullet points \n", ""];
            }
            else if(args[0] === "identify"){
                return ["Summarize the text below and identify the speakers \n", ""];
            }
            else if(args[0] === "sentiment"){
                return ["Summarize the text below and identify the sentiment \n", ""];
            }

        }else if(args.length > 1){
            if(args[0] === "normal"){
                return ["Summarize the text below \n", args[1]];
            }
            else if(args[0] === "bullet"){
                return ["Summarize the text below as bullet points \n", args[1]];
            }

            else if(args[0] === "bullet"){
                return [`Summarize the text below in ${args[1]} words \n`, ""];
            }

            else if(args[0] === "custom"){
                return [args.slice(1).toString(), ""];
            }

        }

        return [];
    }

    private async sendMessage(context: SlashCommandContext, modify: IModify, message: string): Promise<void> {
        const messageStructure = modify.getCreator().startMessage();
        const sender = context.getSender();
        const room = context.getRoom();

        
        messageStructure
        .setSender(sender)
        .setRoom(room)
        .setText(message);

        await modify.getCreator().finish(messageStructure);
    }

    private async buildMessage(read: IRead, roomId: string, command: string, limit: string): Promise<string>{

        var query: string[] = [command];

        const liveChatReader: ILivechatRead = read.getLivechatReader();

        const messages: IMessage[] = await liveChatReader._fetchLivechatRoomMessages(roomId);

        if(limit === ""){
            var length = messages.length;
        }else{
            var length = Math.min(+limit, messages.length);
        }

        for (let index = 0; index < length; index++) {
            const element = messages[index];
            var line = element.sender.name + ":" + element.text + "\n";
            query.push(line);
            
        }

        var queryString: string = query.toString()

        return queryString;

    }

     
    private tempMessage(command: string, limit: string): string{
        var query: string[] = [];

        query.push("John: Hello, how are you doing today? \n");
        query.push("Jane: I am doing great, how about you? \n");
        query.push("John: I am doing great as well. \n");
        query.push("Jane: That is good to hear. \n");
        query.push("John: Yes it is. \n");
        query.push("Jane: So what are you up to today? \n");
        query.push("John: Not much, just hanging out. \n");
        query.push("Jane: That is cool. \n");
        query.push("John: Yeah it is. \n");
        query.push("Jane: So what do you like to do for fun? \n");
        query.push("John: I like to play video games. \n");
        query.push("Jane: That is cool. \n");
        query.push("John: Yeah it is. \n");
        query.push("Jane: What is your favorite game? \n");
        query.push("John: My favorite game is League of Legends. \n");
        query.push("Jane: That is cool. \n");

        var newQuery: string[] = [command];

        if(limit === ""){
            var length = query.length;
        }else{
            var length = Math.min(+limit, query.length);
        }

        for (let index = 0; index < length; index++) {
            const element = query[index];
            
            newQuery.push(element);
            
        }

        return newQuery.toString();
    }
    
    public async summarizeText(read: IRead, http: IHttp, message: string): Promise<string>{

        const API_KEY = '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';
        

        var headers = {
            Authorization: "Bearer " + API_KEY,
            "Content-Type": "application/json",
        };

        const payload = {
            model: "text-davinci-003",
            prompt: message,
            temperature: 0,
            max_tokens: 2000,
        };

        var response: IHttpResponse = await http
            .post("https://api.openai.com/v1/completions", {
                headers: headers,
                data: payload,
            });

        
       if (response.data.choices){
        return "*Summary* \n" + response.data.choices[0].text;
       }

       return "No summary available"

                
    }
}


