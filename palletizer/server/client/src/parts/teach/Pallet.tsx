import React, { useContext, useState, Fragment, ReactElement, ChangeEvent } from 'react';

import ContentItem, { ContentItemProps, ButtonProps } from "./ContentItem";

import { getPalletDimensions, Coordinate, PlaneDimensions, PalletGeometry } from "./structures/Data";

//import { PalletGeometry, getPalletDimensions, Coordinate, PlaneDimensions } from "./structures/Data";

import Jogger from "./Jogger";

import PalletRender from "./3D/PalletRender";
import PlusIcon, { IconProps, XIcon } from "./PlusIcon";

import { Rect, LayoutModel, PALLETCORNERS, IncreaseCorner, DecreaseCorner, CornerNumber } from "./Layers";

// Styles for summary -- rename later.
import "./css/BoxSize.scss";
//import "../css/TeachMode.scss";
import "./css/Corners.scss";

import PalletImage from "../images/Pallet.jpg";

interface DimensionCellProps {
    axis: string;
    value: number;
}

function DimensionCell({ axis, value }: DimensionCellProps) {
    return (
        <div className="DimensionCell">
            <span>
                {axis + ": " + String(value) + "mm"}
            </span>
        </div>
    );
};

//---------------Pallet Model---------------
interface PalletModelProps {
    pallet: PalletGeometry;
    size: number; // 650 for half content width;
    corner: PALLETCORNERS;
}


function PalletModel({ pallet, size, corner }: PalletModelProps) {

    let s = size * 9 / 10;

    let layoutProps: any = {
        size: s,
        pallet,
        outerHeight: s,
        outerWidth: s,
        fullWidth: size,
        fullHeight: size,
        corner
    };


    return (
        <svg width={size} height={size}>
            <LayoutModel {...layoutProps} />
        </svg>
    );
};




interface NewPalletProps {
    startEdit: () => void;
};


function NewPallet({ startEdit }: NewPalletProps) {
    return (
        <div className="NewBox">
            <div className="NewBoxButton" onClick={startEdit}>
                <PlusIcon height={20} width={20} />
                <span>
                    {"Add new pallet"}
                </span>
            </div>
        </div>
    );
};

interface PalletCellProps {
    pallet: PalletGeometry;
    startEdit: () => void;
}

function PalletCell({ pallet, startEdit }: PalletCellProps) {

    let { width, length } = getPalletDimensions(pallet)

    let iconSize = 30;
    let size = 100;

    let model_props = {
        pallet,
        size,
        outerWidth: size,
        outerHeight: size
    };

    return (
        <div className="BoxCellContainer">
            <div className="BoxCell">
                <div className="MiniRender">
                    <LayoutModel {...model_props} />
                    {/* <img src={PalletImage} /> */}
                </div>
                <div className="Name">
                    <input type="text" placeholder={pallet.name} />
                </div>
                <div className="Dimensions">
                    <div className="DimensionsGrid2">
                        <div className="Dimension">
                            <span>
                                {"Width: " + String(width)}
                            </span>
                        </div>
                        <div className="Dimension">
                            <span>
                                {"Length: " + String(length)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="Edit">
                    <div className="EditButton" onClick={startEdit}>
                        <span>
                            {"Edit"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="Trash">
                <span className="icon-delete">
                </span>
            </div>
        </div >
    );
}

interface NewPalletCellProps {
    startEdit: () => void;
}

function NewPalletCell({ startEdit }: NewPalletCellProps) {
    let iconSize = {
        height: 50,
        width: 50
    } as IconProps;

    return (
        <div className="BoxCellContainer">
            <div className="NewBoxCell" onClick={startEdit}>
                <div className="Icon">
                    <PlusIcon {...iconSize} />
                </div>
                <div className="BoxName">
                    <span>
                        {"Add A New Pallet"}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface PalletCornerProps {
    //    allPallets =
    allPallets: PalletGeometry[];
    handleNext: () => void;
    handleBack: () => void;
    setPallets: (pallets: PalletGeometry[]) => void;
    instructionNumber: number;
}


function defaultPallet(index: number): PalletGeometry {
    let p: PalletGeometry = {
        name: "Pallet " + String(index),
        corner1:
        {
            x: 0,
            y: 500,
            z: 0,
        },
        corner2: {
            x: 0,
            y: 0,
            z: 0.
        },
        corner3: {
            x: 500,
            y: 0,
            z: 0
        },
        Layers: [],
        Stack: []
    };
    return p;
}

function PalletCorners({ instructionNumber, allPallets, handleNext, handleBack, setPallets }: PalletCornerProps) {
    let [summaryScreen, setSummaryScreen] = useState<boolean>(allPallets.length > 0);

    let [cornerNumber, setCornerNumber] = useState<PALLETCORNERS>(PALLETCORNERS.TOP_LEFT); // ()

    // Start with a default pallet for editing...
    let [editingPallet, setEditingPallet] = useState<PalletGeometry>(defaultPallet(allPallets.length + 1));

    let [editComplete, setEditComplete] = useState<boolean>(false);

    let LeftButton: ButtonProps = {
        name: "Back",
        action: () => {
            if (summaryScreen) {
                handleBack()
            } else {
                if (allPallets.length > 0) {
                    setSummaryScreen(true);
                } else {
                    handleBack();
                }
            }
        }
    };




    let RightButton: ButtonProps = {
        name: summaryScreen ? "Next" : "Done",
        action: () => {
            if (summaryScreen) {
                handleNext();
            } else {
                // if All corners are selected.
                if (editComplete) {
                    console.log("Check that all corners are selected...");

                    let temp: PalletGeometry = { ...editingPallet };
                    temp.Layers = [];

                    // Save the data.
                    let newPallets = [...allPallets, temp];

                    setPallets(newPallets);
                    setSummaryScreen(true);
                }

            }
        }
    };

    let setPalletName = (name: string) => {
        setEditingPallet({ ...editingPallet, name });
    };

    let startEdit = (index: number) => () => {
        if (index >= 0) {
            setEditComplete(true);
            setEditingPallet(allPallets[index]);
        } else {
            setEditComplete(false);
            setEditingPallet(defaultPallet(allPallets.length));
        }
        setCornerNumber(PALLETCORNERS.TOP_LEFT);
        setSummaryScreen(false);
    };

    let title = "Select Corner " + String(CornerNumber(cornerNumber) + 1);

    let backAction = () => {
        if (cornerNumber !== PALLETCORNERS.TOP_LEFT) {
            setCornerNumber(DecreaseCorner(cornerNumber));
        }
    };

    let addCorner = (c: Coordinate) => {
        switch (cornerNumber) {
            case (PALLETCORNERS.TOP_LEFT): {
                setEditingPallet({ ...editingPallet, corner1: c });
                break;
            };
            case (PALLETCORNERS.BOTTOM_LEFT): {
                setEditingPallet({ ...editingPallet, corner2: c });
                break;

            };
            case (PALLETCORNERS.BOTTOM_RIGHT): {
                setEditingPallet({ ...editingPallet, corner3: c });
                break;
            };
        };

        if (cornerNumber === PALLETCORNERS.BOTTOM_RIGHT) {
            setEditComplete(true);
        } else {
            setCornerNumber(IncreaseCorner(cornerNumber));
        }
    };

    let instruction: string;

    if (summaryScreen) {
        instruction = "Create and edit pallets";
        return (
            <ContentItem instruction={instruction} instructionNumber={instructionNumber} LeftButton={LeftButton} RightButton={RightButton}>
                <div className="BoxSummary">
                    <div className="BoxScrollContainer">
                        <div className="BoxScroll">
                            {allPallets.map((p: PalletGeometry, i: number) => {
                                return (
                                    <PalletCell pallet={p} key={i} startEdit={startEdit(i)} />
                                )
                            })}
                            <NewPallet startEdit={startEdit(-1)} />
                        </div>
                    </div>
                </div>
            </ContentItem>
        );
        // <NewBox startEdit={startEdit(-1)} />
        //  <CornerSummary startEdit={startEdit} allPallets={allPallets} />
    } else {
        let size = 650;
        // Dont use the same pallet on the model, 
        instruction = "Move to corner " + String(CornerNumber(cornerNumber) + 1) + " and click select. ";

        return (
            <ContentItem instructionNumber={instructionNumber} instruction={instruction} LeftButton={LeftButton} RightButton={RightButton} >
                <div className="CornerGrid">
                    <div className="PickLocationGrid">
                        <Jogger selectAction={addCorner} name={editingPallet.name} updateName={setPalletName} />
                        <div className="PalletContainer">
                            <div className="PalletMount">
                                <PalletModel size={size} pallet={defaultPallet(-2)} corner={cornerNumber} />
                            </div>
                        </div>
                    </div>
                </div>
            </ContentItem>
        );

    };
}

// <PalletRender cornerNumber={cornerNumber as number} />

export default PalletCorners;
