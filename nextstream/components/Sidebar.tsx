import { useState, useEffect, useLayoutEffect, useRef, Children, cloneElement } from "react";
import cn from 'classnames';
import { useSpring, animated, useTransition } from '@react-spring/web';
import useMeasure from "react-use-measure";
import { BiDotsVertical, BiCaretRight } from 'react-icons/bi';
import { IoIosCheckmark } from 'react-icons/io';
import Slider from 'react-input-slider';
import Content from "../assets/Icon/Content/Content.svg"
import Aggregation from "../assets/Icon/Aggregation/Aggregation.svg"
import Far from "../assets/Icon/Far/Far.svg"
import Near from "../assets/Icon/Near/Near.svg"
import { useCallback } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import bg from '../assets/bg.png';

const StreamCover = ({ classname, imageOpacity }) => {
    const bgImage = {
        backgroundImage: `url(${bg})`,
        zIndex: -1,
        backgroundSize: "cover",
        opacity: imageOpacity,
    }
}

const InlineContent = ({ name, kind }) => {
    
}