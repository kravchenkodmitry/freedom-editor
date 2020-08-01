const {
  FreedomEditor
} = require('../src/index.js')

const {
  Paragraph
} = require('@freedom-editor/vanilla-paragraph-block')

const jsdom = require('jsdom')
const {
  JSDOM
} = jsdom
const dom = new JSDOM('<html><body></body></html>')

global.document = dom.window.document
global.window = dom.window
global.navigator = dom.window.navigator

const chai = require('chai')
const expect = chai.expect

describe('FreedomEditorInstance.removeBlock()', function () {
  let editorContainer, editor, paragraphBlock
  beforeEach(function (done) {
    paragraphBlock = new Paragraph()
    editorContainer = document.createElement('div')
    editorContainer.setAttribute('id', 'freedom-editor')
    document.body.append(editorContainer)

    done()
  })

  afterEach(function (done) {
    editorContainer.remove()

    done()
  })

  describe('if the target block is included in block template', function () {
    let blocksInDOMNameList, blockTemplateBlockInstanceNameList
    it('should not remove that block from DOM', function (done) {
      editor = new FreedomEditor({
        containerId: 'freedom-editor',
        defaultBlock: paragraphBlock,
        registeredBlocks: [
          paragraphBlock
        ],
        blockTemplate: [
          paragraphBlock
        ]
      })

      editor.init([])

      editor.loadBlocks();

      [...editor.editor.childNodes].forEach((blockInDOM) => editor.removeBlock(blockInDOM))

      blocksInDOMNameList = [...editor.editor.childNodes].map((blockInDOM) => blockInDOM.dataset.blockType)

      blockTemplateBlockInstanceNameList = editor.options.blockTemplate.map((blockInstance) => blockInstance.constructor.name)

      expect(blocksInDOMNameList).to.eql(blockTemplateBlockInstanceNameList)

      done()
    })
  })

  describe('if the target block is not included in block template', function () {
    let blocksInDOMNameList
    describe('if the target block is the last block in editor', function () {
      it('should not remove that block from DOM', function (done) {
        editor = new FreedomEditor({
          containerId: 'freedom-editor',
          defaultBlock: paragraphBlock,
          registeredBlocks: [
            paragraphBlock
          ],
          blockTemplate: [

          ]
        })

        editor.init([])

        editor.loadBlocks();

        [...editor.editor.childNodes].forEach((blockInDOM) => editor.removeBlock(blockInDOM))

        let defaultBlockInstanceNameList

        if (!Array.isArray(editor.options.defaultBlock)) {
          defaultBlockInstanceNameList = editor.options.defaultBlock.constructor.name
          blocksInDOMNameList = [...editor.editor.childNodes]
            .map((blockInDOM) => blockInDOM.dataset.blockType)
            .join('')

          expect(editor.editor.childNodes).to.have.lengthOf(1)
          expect(blocksInDOMNameList).to.eql(defaultBlockInstanceNameList)

          done()
        }
      })
    })
  })
})