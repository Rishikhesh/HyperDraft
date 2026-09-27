// How each catalog name is drawn: name -> real React component.
import { defineRegistry } from '@json-render/react'
import { shadcnComponents } from '@json-render/shadcn'
import * as appBlocks from '@/blocks/app'
import * as layoutBlocks from '@/blocks/layout'
import * as marketingBlocks from '@/blocks/marketing'
import * as overrides from '@/blocks/overrides'
import { catalog } from '@/catalog'

export const { registry } = defineRegistry(catalog, {
  components: {
    ...shadcnComponents,
    ...layoutBlocks,
    ...marketingBlocks,
    ...appBlocks,
    ...overrides, // last, so they replace the originals
  },
})
