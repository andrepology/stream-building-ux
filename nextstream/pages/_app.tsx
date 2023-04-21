import '@/styles/globals.css';
import type AppProps from 'next/app';
import styles from '../styles/Home.module.css';

import { Rnd } from 'react-rnd';
import debounce from 'lodash.debounce';
import { ImSpinner2 } from 'react-icons/im';
import { AiOutlineSend } from 'react-icons/ai';

import { VariableSizeGrid } from 'react-window';
import { left } from '@popperjs/core';
import useMeasure from 'react-use-measure';


export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
