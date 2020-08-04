import React, { useRef, useState, DragEvent, ReactElement } from 'react';

import ContentItem from "./ContentItem";

import PlusIcon, { IconProps } from "./PlusIcon";

import { COLORS } from "./shared/Colors";

import Box from "./3D/BoxRender";

import { PalletGeometry, PlaneDimensions, BoxObject } from "./structures/Data";

import "./css/Layout.scss";

interface NewLayoutCellProps {
    startEdit: () => void;
}

interface DropDownProps {
    allPallets: PalletGeometry[];
}

function LayoutDropDown({ allPallets }: DropDownProps) {
    return (
        <div className="LayoutDropDown">
            <select>
                {allPallets.map((pallet: PalletGeometry, index: number) => {
                    return (
                        <option value={index} key={index}> {pallet.name} </option>
                    );
                })}
            </select>
        </div>
    );
};

interface LayoutModelProps {
    pallet: PalletGeometry;
    size: number; // 650 for half content width;
    outerHeight: number;
    outerWidth: number;
    boxes?: BoxPositionObject[];
};

export function LayoutModel({ pallet, size, outerHeight, outerWidth, boxes }: LayoutModelProps) {

    console.log(boxes, "Layout MODEL");

    let dimensions: PlaneDimensions = pallet.getDimensions();

    let norm = Math.sqrt(dimensions.width ** 2 + dimensions.length ** 2);

    let w = dimensions.width / norm * size;
    let l = dimensions.length / norm * size;
    // Scale up the coordinates to take maximum size.
    let scale = (w >= l) ? size / w : size / l;
    w *= scale;
    l *= scale;
    let cx = size / 2;
    //  let cy = size / 2;
    let logColor: string = String(COLORS.LOG);

    let bottomLog: Rect = {
        x: cx - w / 2,
        y: size - (size - l) / 2 - size / 10,
        width: w,
        height: size / 10,
        fill: logColor,
        stroke: logColor,
        strokeWidth: 0
    };
    let topLog: Rect = {
        x: cx - w / 2,
        y: (size - l) / 2,
        width: w,
        height: size / 10,
        fill: logColor,
        stroke: logColor,
        strokeWidth: 0
    };
    // Horizontal planks....
    let plankColor: string = String(COLORS.PLANK);

    let planks = [] as Rect[];
    let plankNumber = 6;
    let spaceFraction = 2 / 3;
    let plankWidth = w * spaceFraction / plankNumber;
    let iX = (w - plankNumber * plankWidth) / (plankNumber - 1) + plankWidth;
    let startX = (size - w) / 2;
    let Y = (size - l) / 2;

    for (let i = 0; i < plankNumber; i++) {
        let plk: Rect = {
            x: startX + i * iX,
            y: Y,
            width: plankWidth,
            height: l,
            fill: plankColor,
            stroke: plankColor,
            strokeWidth: 0
        };
        planks.push(plk);
    }

    let svg_props = {
        width: size,
        height: size,
        x: (outerWidth - size) / 2,
        y: (outerHeight - size) / 2
    } as any;


    let BoxSVGs: Rect[] = [];

    if (boxes) {
        boxes.forEach(({ position, box }: BoxPositionObject) => {
            //
            let { x, y } = position;
            let { width, length } = box.dimensions;

            width *= size * scale / norm;
            length *= size * scale / norm;

            let boxColor = String(COLORS.BOX);

            let boxprops: Rect = {
                x,
                y,
                width,
                height: length,
                fill: boxColor,
                stroke: boxColor,
                strokeWidth: 0
            };

            BoxSVGs.push(boxprops);
        });
    }
    console.log(BoxSVGs);

    let outerSVG = {
        x: 0,
        y: 0,
        width: outerWidth,
        height: outerHeight
    };


    return (
        <svg {...outerSVG} >
            <svg {...svg_props} >
                <rect {...bottomLog} />
                <rect {...topLog} />
                {planks.map((r: Rect, index: number) => {
                    return (
                        <rect {...r} key={index} />
                    );
                })}
            </svg>
            {BoxSVGs.map((r: Rect, index: number) => {
                return (
                    <rect {...r} key={index} />
                );
            })}
        </svg>
    );

};
//---------------Box Image Props---------------
interface BoxImageProps {
    width: number;
    length: number;
}


export interface Rect {
    x: string | number;
    y: string | number;
    width: string | number;
    height: string | number;
    fill: string;
    stroke: string;
    strokeWidth: number | string;
};

/* <rect x="50" y="20" width="150" height="150"
 * style="fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9" /> */

function BoxImage({ width, length }: BoxImageProps) {
    let norm = Math.sqrt(width ** 2 + length ** 2);

    let w = width / norm * 100;
    let h = length / norm * 100;

    let x = 50 - w / 2;
    let y = 50 - h / 2;

    let cardboard = "rgb(89,69,50)";
    let box = "rgb(89,69,50)";

    let rect: Rect = {
        x,
        y,
        width: w,
        height: h,
        fill: box,
        stroke: cardboard,
        strokeWidth: "1"
    };


    return (
        <svg width="100" height="100">
            <g transform="scale(1,1)">
                <rect {...rect} />
            </g>
        </svg>
    )
}


function NewLayoutCell({ startEdit }: NewLayoutCellProps) {
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
                        {"Create A New Layer"}
                    </span>
                </div>
            </div>
        </div>
    );
};



interface DimensionCellProps {
    axis: string;
    value: number;
}

function DimensionCell({ axis, value }: DimensionCellProps) {

    return (
        <div className="DimensionCell">
            <span>
                {axis + ": " + String(value)}
            </span>
        </div>
    );
}


interface SummaryProps {
    startEdit: () => void;
}

function LayoutSummary({ startEdit }: SummaryProps) {
    return (
        <div className="BoxSummary">
            <div className="BoxScrollContainer">
                <div className="BoxScroll">
                    <NewLayoutCell startEdit={startEdit} />
                    {/* {allBoxes.map((val: BoxDimensions, index: number) => {
                        return (
                        <BoxCell {...val} />
                        )
			})} */}
                </div>
            </div>
        </div>
    );
}



interface BoxCellProps {
    box: BoxObject;
    index: number
}

function BoxCell({ box, index }: BoxCellProps) {


    let [isDragging, setIsDragging] = useState<boolean>(false);

    let dragStart = (ev: DragEvent) => {
        ev.dataTransfer.setData("BoxIndex", String(index));
        setIsDragging(true);
    };

    let dragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div className="BoxCell" onDragStart={dragStart} onDragEnd={dragEnd} draggable>
            <Box {...box.dimensions} />
            <div className="BoxDetails">
                <div className="BoxName">
                    <span>
                        {box.name}
                    </span>
                </div>
                <div className="BoxDimensions">
                    <DimensionCell axis={"Width"} value={box.dimensions.width} />
                    <DimensionCell axis={"Length"} value={box.dimensions.length} />
                    <DimensionCell axis={"Height"} value={box.dimensions.height} />
                </div>
            </div>
        </div>
    );

};

interface LayoutProps {
    allBoxes: BoxObject[];
    allPallets: PalletGeometry[];
};



interface SVGPosition {
    x: number;
    y: number;
}

interface BoxPositionObject {
    position: SVGPosition;
    box: BoxObject;
};


function Layout({ allBoxes, allPallets }: LayoutProps) {

    let [summaryScreen, setSummaryScreen] = useState<boolean>(false);

    let DisplayElement = useRef<HTMLDivElement>(null);

    let [modelBoxes, setModelBoxes] = useState<BoxPositionObject[]>([]);

    let startEdit = () => {
        setSummaryScreen(false);
    };

    let instruction: string;
    let placeholder = "Pallet Layer " + String(1);

    let dragOver = (e: DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
    };

    let onDrop = (e: DragEvent<HTMLDivElement>) => {

        if (DisplayElement.current) {
            let { clientX, clientY } = e;

            let { x, y } = DisplayElement.current.getBoundingClientRect();

            let prX = clientX - x;
            let prY = clientY - y;

            let index = parseInt(e.dataTransfer.getData("BoxIndex"));

            let position: SVGPosition = {
                x: clientX - x,
                y: clientY - y
            };

            let bpo: BoxPositionObject = {
                position,
                box: allBoxes[index]
            };

            setModelBoxes([...modelBoxes, bpo]);
        }
    };


    //---------------Display---------------
    if (summaryScreen) {
        instruction = "Create and edit layers";
        return (
            <ContentItem instruction={instruction}>
                <LayoutSummary startEdit={startEdit} />
            </ContentItem>
        );

    } else {

        instruction = "Drag and drop boxes to create a layer";

        let modelDims = {
            outerWidth: 1026,
            outerHeight: 664
        };

        return (
            <ContentItem instruction={instruction}>
                <div className="LayoutContainer">
                    <div className="LayoutName">
                        <div className="NameHolder">
                            <input type="text" placeholder={placeholder} />
                        </div>
                    </div>
                    <div className="BoxScrollContainer">
                        <div className="BoxScroll">
                            {allBoxes.map((box: BoxObject, key: number) => {
                                return (
                                    <div className="BoxCellContainer" key={key}>
                                        <BoxCell box={box} key={key} index={key} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="LayoutModel">
                        <LayoutDropDown allPallets={allPallets} />
                        <div className="LayoutDisplay" ref={DisplayElement} onDragOver={dragOver} onDrop={onDrop}>
                            <LayoutModel pallet={allPallets[0]} size={650} {...modelDims} boxes={modelBoxes} />
                        </div>
                    </div>
                </div>
            </ContentItem>
        );
    }
};


export default Layout;
