const {
  shiftBlockFocus,
  moveBlock,
  getBlockInstanceList
} = require('./utilities/helper.js')

class FreedomEditor {
  constructor (customOptions) {
    const defaultOptions = {
      containerId: 'freedom-editor',
      blockTemplate: [

      ],
      registeredBlocks: {

      },
      blocksControllers: [],
      i18n: {
        locale: 'en-US',
        rtl: 'auto'
      }
    }

    if (customOptions !== undefined && typeof customOptions !== 'object') {
      throw new Error('You can only pass an object as constructor options for FreedomEditor')
      return
    }

    this.options = {
      ...defaultOptions,
      ...customOptions
    }

    this.editor = document.getElementById(this.options.containerId)
    this.editor.setAttribute('dir', this.options.i18n.rtl)

    const afterRenderEditor = new CustomEvent('freedom-editor:after-select-editor-container', {
      detail: {
        editor: this.editor
      },
      cancelable: true
    })

    window.dispatchEvent(afterRenderEditor)

    if (this.editor === null) {
      throw new Error('The given ID for initiating editor container returns null.')
    }

    if (!this.options.defaultBlock) {
      throw new Error('DefaultBlock must be defined when you initiate new editor.')
    }
  }

  /**
   * Initialize editor and hook plugins to the editor in editor level.  Plugins hooked here will apply to all blocks.
   * @param  {Array} pluginsOptions An array containing all init functions of plugins
   * @return {Object} The instance of Freedom Editor
   */
  init (pluginsOptions) {
    if (Array.isArray(pluginsOptions) !== true) {
      throw new Error('You need to pass an array to init')
    }

    this.options.blocksControllers = pluginsOptions

    return this.editor
  }

  /**
   * Render block in the DOM, this is a helper function for loadBlocks()
   * @param  {[Object]} blockInstance Object for a block registered at in editor instance
   * @return {[DOMString]} newBlock  Rendered block DOM string
   */
  renderBlock (blockInstance, isTemplateBlock, savedData, ...additionBlockParam) {
    if (blockInstance === undefined) {
      throw new Error('Block object is not passed to renderBlock()')
      return
    }

    // Assign order attribute to new block
    const newBlock = blockInstance.render(this.options.i18n, savedData, ...additionBlockParam)
    newBlock.dataset.order = this.editor.childNodes.length
    if (isTemplateBlock === true) {
      newBlock.dataset.blockTemplate = true
    }

    // Block controler
    const mergedControllers = [...this.options.blocksControllers, ...blockInstance.options.controllers]

    console.log(mergedControllers)

    mergedControllers.forEach((controller) => {
      controller(newBlock)
    })

    const blockRendered = new CustomEvent('freedom-editor:after-render-block', {
      detail: {
        blockType: newBlock.dataset.blockType,
        block: newBlock
      },
      cancelable: true
    })

    window.dispatchEvent(blockRendered)

    this.editor.append(newBlock)

    return newBlock
  }

  /**
   * Remove a specific block from editor
   * @param  {Object} block Block to be removed
   * @return {undefined}
   */
  removeBlock (block) {
    if (block.matches('[data-block-template]')) {
      return
    }

    // Only shift focus if the block to be removed is not the last block
    this.shiftBlockFocus(block, 'up', block.previousElementSibling)
    block.remove()
  }

  /**
   * Load blocks with data saved previously
   * @param  {Object} savedData Data you saved with saveBlocks(). If you don't pass any saved Data here, blocks listed in block template will be loaded.
   * @return {Array} Blocks loaded in editor instance
   */
  loadBlocks (savedData) {
    if (!savedData) {
      if (Array.isArray(this.options.blockTemplate) !== true) {
        throw new Error('You need to pass array for blockTemplate')
        return
      }

      if (this.options.blockTemplate.length > 0) {
        return this.options.blockTemplate.map((block) => this.renderBlock(block, true))
      }
    }

    return savedData.data.map((block) => {
      const blockIndexInRegisteredBlockList = Object.values(this.options.registeredBlocks)
        .map((registeredBlock) => {
          return registeredBlock.constructor.name
        })
        .indexOf(block.type)

      if (blockIndexInRegisteredBlockList === -1) {
        throw new Error("You are trying to load a block that you haven't registered when you initzalize the editor")
      }

      return this.renderBlock(this.options.registeredBlocks[blockIndexInRegisteredBlockList], false, block.data)
    })
  }

  /**
   * Save data from all blocks
   * @return {Object} An object containing datas of all blocks and saving timestamp
   */
  saveBlocks () {
    // Get block list in editor in DOM
    const blocksInDOM = [...this.editor.childNodes]

    const data = blocksInDOM
      .map((blockInDom, index) => getBlockInstanceList(this)[index].save(blockInDom))
      .filter(
        blockData => blockData !== (false || undefined)
      )

    return {
      timestamp: Date.now(),
      data: data
    }
  }

  /**
   * Reset editor and only keeps its template block
   */
  resetBlocks () {
    [...this.editor.childNodes].forEach((block) => {
      if (!block.matches('[data-block-template]')) {
        block.remove()
      } else {
        block.querySelectorAll('[contenteditable]')
          .forEach((editableBlock) => {
            editableBlock.textContent = ''
          })
      }
    })
  }
}

FreedomEditor.prototype.shiftBlockFocus = shiftBlockFocus
FreedomEditor.prototype.moveBlock = moveBlock

module.exports = FreedomEditor
