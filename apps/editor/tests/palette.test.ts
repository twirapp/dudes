import { expect, it } from 'vitest'

import { createDocument } from '@twirapp/dudes-sprite'

import { useEditor } from '../src/composables/useEditor.js'

it('keeps the default palette and selects a color', () => {
  const editor = useEditor(createDocument('T'))

  expect(editor.palette.value.length).toBeGreaterThanOrEqual(8)
  editor.setColor('#ff0000')
  expect(editor.palette.value[0]).toBe('#ff0000')
  expect(() => editor.setColor('red')).toThrow(RangeError)
})

it('adds a custom color once', () => {
  const editor = useEditor(createDocument('T'))

  editor.addColor('#00ff00')
  editor.addColor('#00ff00')
  expect(
    editor.palette.value.filter((color) => color === '#00ff00')
  ).toHaveLength(1)
})
