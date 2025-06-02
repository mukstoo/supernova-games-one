# Game Data Directory

This directory contains all static game content data organized into logical subdirectories.

## Structure

```
data/
├── index.ts          # Central export point for all game data
├── quests/           # Quest definitions
│   ├── index.ts      # Quest exports and aggregation
│   ├── gather_herbs_1.ts    # Individual quest files
│   ├── kill_boars_1.ts
│   └── kill_orcs_1.ts
└── README.md         # This file
```

## Quest Files

Each quest is defined in its own file following the naming convention `<quest_id>.ts`. This structure provides:

- **Better organization**: Each quest is self-contained
- **Easier maintenance**: Modify individual quests without affecting others
- **Team collaboration**: Multiple developers can work on different quests simultaneously
- **Modularity**: Import specific quests or all quests as needed

### Adding New Quests

1. Create a new file in `data/quests/` following the naming pattern: `<quest_id>.ts`
2. Export your quest object using a camelCase name: `export const myNewQuest: Quest = { ... }`
3. Add the import and export to `data/quests/index.ts`
4. Add the quest to the `allQuests` array

### Example Quest File Structure

```typescript
import { Quest } from '../../utils/questTypes';

const PLACEHOLDER_IMG = '../../assets/images/menu_background.png';

export const myNewQuest: Quest = {
  id: 'my_new_quest',
  title: 'Quest Title',
  description: 'Quest description...',
  // ... rest of quest definition
};
```

## Future Expansions

This directory structure can be extended to include other game data:

- `data/enemies/` - Enemy definitions
- `data/items/` - Item and equipment data  
- `data/locations/` - Location configurations
- `data/characters/` - NPC and character data
- `data/skills/` - Skill definitions
- `data/spells/` - Magic system data

## Usage

Import game data from the central index:

```typescript
// Import all quests
import { allQuests } from '../data';

// Import specific quests
import { gatherHerbs1, killBoars1 } from '../data';

// Import from specific subdirectory
import { killOrcs1 } from '../data/quests';
``` 