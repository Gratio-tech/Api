import { krosh } from 'krosh';
import { name, description, version } from 'package.json';

import endpoints from '~/commands/gen/endpoints';
import types from '~/commands/gen/types';

import 'dotenv/config';

krosh({
  meta: {
    name,
    description,
    version,
  },
  commands: {
    gen: {
      endpoints,
      types,
    },
  },
});
