import React, { ReactNode, useEffect, useState, useRef } from 'react';

// Ace Editor
import AceEditor, { IAceEditorProps } from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-xcode";

import { get_config, post_config } from "../requests/requests";

// Styles
import "./css/Modal.scss";

interface ModalProps {
    children: ReactNode;
    close(): any;
}


function Modal({ children, close }: ModalProps) {

    let modal_class: string = "Modal";

    let close_modal = (e: React.MouseEvent<HTMLElement>) => {
        let target = e.target as HTMLElement;
        if (target.className === modal_class) {
            close();
        }
    };

    return (
        <div className={modal_class} onClick={close_modal}>
            {children}
        </div>
    );
}

interface EditorProps {
    file_name: string;
    title: string;
    machine: boolean;
    close(): any;
}

function Editor({ file_name, title, machine, close }: EditorProps) {

    let handle_edit = (value: string) => {
    }

    let modal_title = "Edit " + title.toLowerCase() + ": " + file_name;

    var [data, set_data] = useState("");

    let editor_settings = {
        mode: "json",
        theme: "xcode",
        onChange: handle_edit,
        name: "AceEditor",
        vale: data,
        style: {
            width: "auto",
            height: "500px"
        }
    } as IAceEditorProps;

    useEffect(() => {
        let fetch_data = async () => {
            let res_data = await get_config(file_name, machine) as any;
            set_data(JSON.stringify(res_data, null, "\t"));
        }
        fetch_data();
    }, []);

    const config_ref = useRef<AceEditor | null>(null);

    let save_config = () => {
        let element = config_ref.current as AceEditor;
        if (element) {
            let json = JSON.parse(element.editor.getValue() as string);
            console.log("Add a check for valid configuration content");
            post_config(file_name, json, close);
        }
    };


    return (
        <Modal close={close}>
            <div className="ModalContent">
                <span id="EditorTitle">
                    {modal_title}
                </span>
                <AceEditor ref={config_ref} {...editor_settings} value={data as string} />
                <div className="EditorFooter">
                    <div className="CloseEditor" onClick={close}>
                        <span>
                            {"Close"}
                        </span>
                    </div>
                    <div className="SaveEditor" onClick={save_config}>
                        <span>
                            {"Save"}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}


interface UnlockProps {
    close(): void;
}


function UnlockItem(props: any) {


    return (
        <div className="UnlockItem">
            {props.children}
        </div>
    )
}

function Unlock({ close }: UnlockProps) {
    let [valid, set_valid] = useState<boolean>(false);

    let password = "123123";

    let handle_input = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === password) {
            set_valid(true);
        } else {
            set_valid(false);
        }
    };

    let handle_close = () => {
        valid && close();
    };

    return (
        <Modal close={handle_close} >
            <div className="Unlock">
                <UnlockItem>
                    <span id="UnlockTitle">
                        {"Enter password to unlock"}
                    </span>
                </UnlockItem>
                <UnlockItem>
                    <input type="password" id="unlock" onChange={handle_input} />
                </UnlockItem>
                <UnlockItem>
                    <div className={"UnlockButton" + (valid ? "" : "Locked")} onClick={handle_close}>
                        <span>
                            Unlock
                        </span>
                    </div>
                </UnlockItem>
            </div>
        </Modal>
    );
}


export { Editor, Unlock };


export default Modal;