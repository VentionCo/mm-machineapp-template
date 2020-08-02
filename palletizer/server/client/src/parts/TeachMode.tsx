import React, { useContext, useState, Fragment, ReactElement, ChangeEvent } from 'react';

import Modal from "./Modal";

import { PalletConfiguration } from "../services/TeachMode";

import ConfigurationName from "./teach/ConfigurationName";
import Jogger from "./teach/Jogger";
import PickLocation from "./teach/PickLocation";
import PalletCorners from "./teach/Corners";
import CompletionDots, { Fraction } from "./teach/CompletionDots";
import BoxSize from "./teach/BoxSize";

import { BoxDimensions } from "./teach/3D/BoxRender";

import { Coordinate, PalletGeometry } from "./teach/structures/Data";

import "./css/TeachMode.scss";
import "./css/Jogger.scss";
import "./css/BoxSize.scss";


enum PalletTeachState {
    CONFIG_NAME,
    PICK_LOCATION, // 0
    BOX_SIZE,
    PALLET_CORNERS,
    ASSIGN_LAYOUT,
    LAYER_SETUP,
    SUMMARY
};

interface PalletConfiguratorProps {
    close: () => void;
};

function PalletConfigurator({ close }: PalletConfiguratorProps) {

    let [headerTitle, setHeaderTitle] = useState<string>("Pallet Configurator");

    let [palletConfig, setPalletConfig] = useState<PalletConfiguration>(new PalletConfiguration());

    let [teachState, setTeachState] = useState<PalletTeachState>(PalletTeachState.BOX_SIZE);

    let completionFraction = { n: 0, d: 6 } as Fraction;

    let ChildElement: ReactElement = (<></>);

    let handleNext = () => {
        let state = teachState;
        setTeachState(++teachState);
    };

    let handleBack = () => {
        console.log(teachState, "teach state");
        if (teachState > 0) {
            let state = teachState;
            setTeachState(--teachState);
        } else {
            close();
        }
    };

    let allBoxes = [] as BoxDimensions[];

    let allPallets = [] as PalletGeometry[];

    for (let i = 0; i < 10; i++) {
        allBoxes.push({ width: 10, height: 10, length: i + 1 });

        let coord: Coordinate = {
            x: 10,
            y: 10,
            z: 10
        };

        let pal = new PalletGeometry(coord, coord, coord);

        allPallets.push(pal);
    }

    switch (teachState) {
        case (PalletTeachState.CONFIG_NAME): {
            ChildElement = (<ConfigurationName handleUpdate={setHeaderTitle} />);

            completionFraction.n = 0;
            break;
        }
        case (PalletTeachState.PICK_LOCATION): {
            ChildElement = (<PickLocation />);

            completionFraction.n = 1;
            break;
        };
        case (PalletTeachState.BOX_SIZE): {
            ChildElement = (<BoxSize allBoxes={allBoxes} />);

            completionFraction.n = 2;
            break;
        }
        case (PalletTeachState.PALLET_CORNERS): {
            ChildElement = (<PalletCorners allPallets={allPallets} />);
            completionFraction.n = 3;
            break;
        };
        case (PalletTeachState.LAYER_SETUP): {
            completionFraction.n = 4;
            break;
        }
        case (PalletTeachState.ASSIGN_LAYOUT): {
            completionFraction.n = 5;
            break;
        }
        case (PalletTeachState.SUMMARY): {
            completionFraction.n = 6;
            break;
        }
        default: {
            console.log("Default Pallet Configurator Case -- unhandled");

        }
    };


    return (
        <Modal close={close}>
            <div className="TeachContainer">
                <div className="TeachModeHeader">
                    <div className="TeachButton" onClick={handleBack}>
                        <span>
                            {((teachState as number === 0) ? "Close" : "Back")}
                        </span>
                    </div>
                    <div className="StatusBar">
                        <div className="StatusBarTitle">
                            <span>
                                {headerTitle}
                            </span>
                        </div>
                        <CompletionDots fraction={completionFraction} />
                    </div>
                    <div className="TeachButton" onClick={handleNext}>
                        <span>
                            Next
			</span>
                    </div>
                </div>
                {ChildElement}
            </div>
        </Modal>
    );
};

export default PalletConfigurator;


