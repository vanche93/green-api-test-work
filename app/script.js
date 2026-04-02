const apiUrl = "https://api.green-api.com/";

const textarea = document.getElementById("returnTextarea");
const getSettingsBtn = document.getElementById("getSettingsBtn");
const getStateInstanceBtn = document.getElementById("getStateInstanceBtn");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const sendFileBtn = document.getElementById("sendFileBtn");
const idInstanceInput = document.getElementById("idInstance");
const apiTokenInstanceInput = document.getElementById("apiTokenInstance");
const sendMessageChatIdInput = document.getElementById("messageChatId");
const sendFileChatIdInput = document.getElementById("fileChatId");
const messageInput = document.getElementById("message");
const urlFileInput = document.getElementById("urlFile");
const idRe = /^\d+(?:-\d+)?@(c|g)\.us$/;

window.addEventListener("DOMContentLoaded", () => {
    const savedIdInstance = sessionStorage.getItem("idInstance");
    const savedApiToken = sessionStorage.getItem("apiTokenInstance");

    if (savedIdInstance) idInstanceInput.value = savedIdInstance;
    if (savedApiToken) apiTokenInstanceInput.value = savedApiToken;
});

idInstanceInput.addEventListener("change", () => {
    sessionStorage.setItem("idInstance", idInstanceInput.value);
});

apiTokenInstanceInput.addEventListener("change", () => {
    sessionStorage.setItem("apiTokenInstance", apiTokenInstanceInput.value);
});

sendFileChatIdInput.addEventListener("input", () => {
    if (!idRe.test(sendFileChatIdInput.value)) {
        markIsInvalidInput(sendFileChatIdInput);
    } else {
        clearInvalidInputMark(sendFileChatIdInput);
    }
});
    
sendMessageChatIdInput.addEventListener("input", () => {
    if (!idRe.test(sendMessageChatIdInput.value)) {
        markIsInvalidInput(sendMessageChatIdInput);
    } else {
        clearInvalidInputMark(sendMessageChatIdInput);
    }
});

function markIsInvalidInput(inputField) {
    inputField.classList.add("is-invalid");
}

function clearInvalidInputMark(inputField) {
    inputField.classList.remove("is-invalid");
}

function clearAllInvalidInputMark() {
    document.querySelectorAll(".is-invalid").forEach(el =>
            el.classList.remove("is-invalid")
        );
}

async function apiCall(endpoint, options = {}) {
    clearAllInvalidInputMark();
    const response = await fetch(`${apiUrl}waInstance${idInstanceInput.value}/${endpoint}/${apiTokenInstanceInput.value}`, options);
    if (response.headers.get("Content-Type")?.includes("application/json") && response.ok) {
            return response.json();
    } else if (response.status === 401) {
        markIsInvalidInput(apiTokenInstanceInput);
        throw new Error("Unauthorized: Please check your apiTokenInstance.");
    } else if (response.status === 403) {
        markIsInvalidInput(idInstanceInput);
        throw new Error("Forbidden: Please check your idInstance.");
    } else {
        throw new Error(`${response.statusText} (${response.status})`);
    }

}

getSettingsBtn.addEventListener("click", async () => {
    try {
        const data = await apiCall("getSettings", {method: "GET"});
        textarea.value = JSON.stringify(data, null, 2);
    } catch (error) {
        textarea.value = "Error: " + error.message;
    }
});

getStateInstanceBtn.addEventListener("click", async () => {
    try {
        const data = await apiCall("getStateInstance", {method: "GET"});
        textarea.value = JSON.stringify(data, null, 2);
    } catch (error) {
        textarea.value = "Error: " + error.message;
    }
});



sendMessageBtn.addEventListener("click", async () => {
    if (!idRe.test(sendMessageChatIdInput.value) || !sendMessageChatIdInput.value.trim()) {
        markIsInvalidInput(sendMessageChatIdInput);
        textarea.value = "Error: Invalid chatId format. It should be like '1234567890@c.us' or '1234567890@g.us'";
        return;
    }
    if (!messageInput.value.trim()) {
        markIsInvalidInput(messageInput);
        textarea.value = "Error: Message cannot be empty.";
        return;
    }
    try {
        const data = await apiCall("sendMessage", {
            method: "POST",
            body: JSON.stringify({
                chatId: sendMessageChatIdInput.value,
                message: messageInput.value
            })
        })
        textarea.value = JSON.stringify(data, null, 2);
    } catch (error) {
        textarea.value = "Error: " + error.message;
    }
});


sendFileBtn.addEventListener("click", async () => {
    if (!idRe.test(sendFileChatIdInput.value) || !sendFileChatIdInput.value.trim()) {
        markIsInvalidInput(sendFileChatIdInput);
        textarea.value = "Error: Invalid chatId format. It should be like '1234567890@c.us' or '1234567890@g.us'";
        return;
    }
    if (!urlFileInput.value.trim()) {
        markIsInvalidInput(urlFileInput);
        textarea.value = "Error: urlFile cannot be empty.";
        return;
    }
    try {
        const data = await apiCall("sendFileByUrl", {
            method: "POST",
            body: JSON.stringify({
                chatId: sendFileChatIdInput.value,
                urlFile: urlFileInput.value,
                fileName: urlFileInput.value.split("/").pop()
            })
        })
        textarea.value = JSON.stringify(data, null, 2);
    } catch (error) {
        textarea.value = "Error: " + error.message;
    }
});
