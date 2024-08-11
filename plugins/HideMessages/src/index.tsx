import { findByProps } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import { before, after } from "@vendetta/patcher";
import { React } from "@vendetta/metro/common";
import { getAssetIDByName as getAssetId } from "@vendetta/ui/assets";
import { findInReactTree } from "@vendetta/utils";
import Settings from "./components/Settings";
import { storage } from "@vendetta/plugin";
import { RedesignRow } from "@nexpid/vdp-shared";

let patches = [];

const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
const Messages = findByProps("startEditMessage", "editMessage");
const MessageStore = findByProps("getMessage", "getMessages");
const ChannelStore = findByProps("getChannel", "getDMFromUserId");

function onLoad() {
    let dirtyEdit = false;

    // Patch to add "Hide Message" and "Spoof Message" options
    patches.push(before("openLazy", LazyActionSheet, ([component, key, msg]) => {
        const message = msg?.message;
        if (key !== "MessageLongPressActionSheet" || !message) return;

        component.then((instance) => {
            const unpatch = after("default", instance, (_, component) => {
                React.useEffect(() => () => {
                    unpatch();
                }, []);

                const buttons = findInReactTree(component, (x) => x?.[0]?.type?.name === "ButtonRow");
                if (!buttons) return;

                // "Hide Message" Button
                buttons.splice(storage.hideMessagesIndex || 2, 0,
                    <RedesignRow
                        label={"Hide Message"}
                        icon={getAssetId("ic_close_16px")}
                        onPress={() => {
                            FluxDispatcher.dispatch({
                                type: "MESSAGE_DELETE",
                                channelId: message.channel_id,
                                id: message.id,
                                __vml_cleanup: true,
                                otherPluginBypass: true
                            });
                            LazyActionSheet.hideActionSheet();
                        }}
                    />
                );

                // "Spoof Message" Button
                const ButtonRow = buttons[0]?.type;
                if (ButtonRow) {
                    buttons.splice(0, 0,
                        <ButtonRow
                            key="69"
                            onPressRow={() => {
                                LazyActionSheet.hideActionSheet();
                                Messages.startEditMessage(
                                    `dirty-${message.channel_id}`,
                                    message.id,
                                    message.content
                                );
                            }}
                            message="Spoof message"
                            iconSource={getAssetId("ic_message_retry")}
                        />
                    );
                }
            });
        });
    }));

    // Handle dirty edit logic to spoof the message locally
    patches.push(before(Messages, "startEditMessage", (_, args) => {
        if (args[0].startsWith("dirty-")) {
            args[0] = args[0].replace("dirty-", "");
            dirtyEdit = true;
        } else {
            dirtyEdit = false;
        }
    }));

    patches.push(before(Messages, "editMessage", (_, args) => {
        if (dirtyEdit) {
            const originalMessage = MessageStore.getMessage(args[0], args[1]);
            FluxDispatcher.dispatch({
                type: "MESSAGE_UPDATE",
                message: {
                    ...originalMessage,
                    ...args[2],
                    edited_timestamp: originalMessage.editedTimestamp,
                    mention_roles: originalMessage.mentionRoles,
                    mention_everyone: originalMessage.mentionEveryone,
                    member: originalMessage.author,
                    guild_id: ChannelStore.getChannel(originalMessage.channel_id).guild_id,
                },
                log_edit: false,
            });
            args.length = 0;
        }
    }));
}

function onUnload() {
    for (const unpatch of patches) {
        unpatch();
    }
}

export default {
    onLoad,
    onUnload,
    settings: Settings
};
