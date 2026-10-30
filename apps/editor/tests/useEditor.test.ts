import { beforeEach, expect, it } from 'vitest'

import {
  createDocument,
  getPixel,
  parseHexColor,
  setPixel
} from '@twirapp/dudes-sprite'

import { useEditor } from '../src/composables/useEditor.js'

let editor: ReturnType<typeof useEditor>

beforeEach(() => {
  editor = useEditor(createDocument('T'))
})

it('starts on body, frame 0 and paints', () => {
  expect(editor.activeLayer.value).toBe('body')
  expect(editor.activeFrame.value).toBe(0)

  editor.setTool('brush')
  editor.beginStroke()
  editor.paint(2, 3)
  editor.endStroke()

  expect(getPixel(editor.doc.value, 'body', 0, 2, 3)).toBe(
    parseHexColor(editor.palette.value[0])
  )
})

it('eraser writes transparent pixels', () => {
  editor.setTool('brush')
  editor.beginStroke()
  editor.paint(1, 1)
  editor.endStroke()

  editor.setTool('eraser')
  editor.beginStroke()
  editor.paint(1, 1)
  editor.endStroke()

  expect(getPixel(editor.doc.value, 'body', 0, 1, 1)).toBe(0)
})

it('fill paints the whole active layer frame', () => {
  editor.setTool('fill')
  editor.beginStroke()
  editor.paint(0, 0)
  editor.endStroke()

  expect(getPixel(editor.doc.value, 'body', 0, 31, 31)).not.toBe(0)
  expect(getPixel(editor.doc.value, 'eyes', 0, 31, 31)).toBe(0)
})

it('picks the color from the active layer', () => {
  setPixel(editor.doc.value, 'eyes', 0, 5, 5, parseHexColor('#123456'))
  editor.setLayer('eyes')
  editor.setTool('eyedropper')
  editor.paint(5, 5)

  expect(editor.palette.value[0]).toBe('#123456')
})

it('saveFrameAndNext copies the frame and advances', () => {
  editor.setTool('brush')
  editor.beginStroke()
  editor.paint(4, 4)
  editor.endStroke()

  expect(editor.saveFrameAndNext()).toBe(true)
  expect(editor.activeFrame.value).toBe(1)
  expect(getPixel(editor.doc.value, 'body', 1, 4, 4)).toBe(
    parseHexColor(editor.palette.value[0])
  )
})

it('does not wrap past the last frame', () => {
  editor.setFrame(8)
  expect(editor.saveFrameAndNext()).toBe(false)
  expect(editor.activeFrame.value).toBe(8)
})

it('undoes and redoes a stroke as one step', () => {
  editor.setTool('brush')
  editor.beginStroke()
  editor.paint(1, 1)
  editor.paint(2, 1)
  editor.endStroke()

  expect(editor.canUndo.value).toBe(true)

  editor.undo()
  expect(getPixel(editor.doc.value, 'body', 0, 1, 1)).toBe(0)
  expect(getPixel(editor.doc.value, 'body', 0, 2, 1)).toBe(0)
  expect(editor.canUndo.value).toBe(false)
  expect(editor.canRedo.value).toBe(true)

  editor.redo()
  expect(getPixel(editor.doc.value, 'body', 0, 2, 1)).not.toBe(0)
  expect(editor.canRedo.value).toBe(false)
})

it('resets history when replacing the document', () => {
  editor.setTool('brush')
  editor.beginStroke()
  editor.paint(1, 1)
  editor.endStroke()

  const next = createDocument('Next')
  editor.replaceDocument(next)

  expect(editor.doc.value.name).toBe('Next')
  expect(editor.canUndo.value).toBe(false)
  expect(editor.canRedo.value).toBe(false)

  editor.undo()
  expect(editor.doc.value.name).toBe('Next')
  expect(getPixel(editor.doc.value, 'body', 0, 1, 1)).toBe(0)
})

it('does not record history for the eyedropper', () => {
  setPixel(editor.doc.value, 'eyes', 0, 5, 5, parseHexColor('#123456'))
  editor.setLayer('eyes')
  editor.setTool('eyedropper')
  editor.beginStroke()
  editor.paint(5, 5)
  editor.endStroke()

  expect(editor.canUndo.value).toBe(false)
  expect(editor.palette.value[0]).toBe('#123456')
})

it('marks a colored body as an error', () => {
  editor.palette.value = ['#FF0000']
  editor.setTool('brush')
  editor.beginStroke()
  editor.paint(1, 1)
  editor.endStroke()

  expect(editor.issues.value).toContainEqual(
    expect.objectContaining({ code: 'body-not-grayscale' })
  )
})
