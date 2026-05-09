import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  /**
   * `studioHost` becomes the URL of your hosted studio:
   * https://bosfoot.sanity.studio
   * (run `pnpm studio:deploy` after first dev run to claim it)
   */
  studioHost: 'bosfoot',
})
