import assert from 'node:assert/strict';
import test from 'node:test';

import {
    blocksToSRT,
    createSmartChunks,
    formatTranslatedText,
    parseSRT
} from './translate-srt.mjs';

test('parses CRLF SRT files and preserves multiline subtitle text', () => {
    const blocks = parseSRT('1\r\n00:00:00,000 --> 00:00:01,000\r\nHello\r\nworld\r\n\r\n2\r\n00:00:02,000 --> 00:00:03,000\r\nBye');
    assert.deepEqual(blocks, [
        { index: 1, timestamp: '00:00:00,000 --> 00:00:01,000', text: ['Hello', 'world'] },
        { index: 2, timestamp: '00:00:02,000 --> 00:00:03,000', text: ['Bye'] }
    ]);
});

test('creates sentence-aware chunks without losing blocks', () => {
    const blocks = [1, 2, 3, 4].map((index) => ({
        index,
        timestamp: `${index} --> ${index + 1}`,
        text: [index === 2 ? 'A sentence.' : `Line ${index}`]
    }));
    const chunks = createSmartChunks(blocks, 2);
    assert.deepEqual(chunks.flat().map((block) => block.index), [1, 2, 3, 4]);
    assert.equal(chunks.length, 2);
});

test('serializes blocks back to SRT', () => {
    const blocks = parseSRT('1\n00:00:00,000 --> 00:00:01,000\nHello');
    assert.equal(blocksToSRT(blocks), '1\n00:00:00,000 --> 00:00:01,000\nHello');
});

test('formats RTL punctuation and direction markers', () => {
    const result = formatTranslatedText('مرحبا, كيف حالك؟', 'Arabic');
    assert.match(result, /^\u200F\u202B/);
    assert.match(result, /،/);
    assert.match(result, /؟/);
    assert.match(result, /\u202C$/);
});
