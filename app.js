const fs = require('fs/promises');

(async () => {
    // methods

    const createFile = async (fileName) => {
        try {
            await fs.writeFile(__dirname + "/" + fileName, "Hello World");
        } catch (error) {
            console.error(error);
        }
    };

    const deleteFile = async (fileName) => {
        try {
            await fs.unlink(__dirname + "/" + fileName);
        } catch (error) {
            if (error.code === "ENOENT") {
                console.log("File not found");
            }
        }
    }

    const renameFile = async (fileName, newFileName) => {
        try {
            await fs.rename(__dirname + "/" + fileName, __dirname + "/" + newFileName);
        } catch (error) {
            if (error.code === "ENOENT") {
                console.log("File not found");
            }
        }
    };

    const addContent = async (fileName, content) => {
        try {
            const fileHandler = await fs.open(__dirname + "/" + fileName, "a");
            await fileHandler.appendFile(content);
            console.log("Content added successfully");
            fileHandler.close();
        } catch (error) {
            console.error(error);
        }
    };

    // Commands
    const CREATE_FILE = "create a file";
    const DELETE_FILE = "delete a file";
    const RENAME_FILE = "rename a file";
    const ADD_CONTENT = "add content to a file";

    // open the file
    const commandFileHandler = await fs.open("./commands.txt", "r");

    // read the file
    commandFileHandler.on("change", async () => {
        console.clear();
        const size = (await commandFileHandler.stat()).size;
        const buff = Buffer.alloc(size);
        const offset = 0;
        const length = buff.byteLength;
        const position = 0;

        await commandFileHandler.read(buff, offset, length, position);
        const command = buff.toString("utf-8");
        // create a new file
        if (command.includes(CREATE_FILE)) {
            const fileName = command.substring(CREATE_FILE.length + 1);
            createFile(fileName);
        }
        else if (command.includes(DELETE_FILE)) {
            const fileName = command.substring(DELETE_FILE.length + 1);
            deleteFile(fileName);
        }
        else if (command.includes(RENAME_FILE)) {
            const fileName = command.substring(RENAME_FILE.length + 1, command.indexOf("to") - 1);
            const newFileName = command.substring(command.indexOf("to") + 3);
            //Command: rename a file <file name> to <new file name>
            renameFile(fileName, newFileName);
        }
        else if (command.includes(ADD_CONTENT)) {
            const fileName = command.substring(ADD_CONTENT.length + 1, command.indexOf("with") - 1);
            const content = command.substring(command.indexOf("with") + 5);
            //Command: add content to a file <file name> with <content>
            addContent(fileName, content);
        } else {
            console.log("Command not found");
        }
    });

    // watch for changes

    const watcher = fs.watch("./commands.txt");
    for await (const event of watcher) {
        if (event.eventType === "change") {
            commandFileHandler.emit("change");
        }
    }

    await commandFileHandler.close();
})();