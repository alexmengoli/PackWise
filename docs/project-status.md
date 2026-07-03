# PackWise Project Status

PackWise is an offline-first packing organizer for people who want to prepare bags, backpacks, or gear kits based on the activity they are about to do.

Users can define their own items, group them by one or more activities, and generate a packing checklist by selecting the relevant activities. The core app should remain usable without an account, network access, or cloud sync.

## Product Goal

Help users prepare quickly for a specific activity while reducing the chance of forgetting important items.

Example activities include:

- Beach
- Mountain biking
- Camping
- Hiking
- Gym
- Travel
- Work
- Picnic

## Core Concepts

### Items

An item represents a physical thing the user may want to bring.

Example:

```json
{
  "id": "item-1",
  "name": "Sunscreen",
  "description": "SPF 50 protection",
  "is_optional": false,
  "notes": "Check the expiration date"
}
```

## Initial Data Model

### Items

Represents a physical item that can be included in one or more packing lists.

| Field         | Type          | Required | Description                                             |
| ------------- | ------------- | -------- | ------------------------------------------------------- |
| `id`          | UUID / string | Yes      | Unique item identifier.                                 |
| `name`        | string        | Yes      | Item name.                                              |
| `description` | string        | No       | Free-form item description.                             |
| `is_optional` | boolean       | No       | Whether the item is optional rather than essential.     |
| `weight`      | number        | No       | Item weight, ideally stored in grams.                   |
| `size`        | string        | No       | Item size or dimensions, for example `30 x 20 x 10 cm`. |
| `notes`       | string        | No       | Additional notes about the item.                        |
| `created_at`  | datetime      | Yes      | Creation timestamp.                                     |
| `updated_at`  | datetime      | Yes      | Last update timestamp.                                  |

### Activities

Represents an activity, trip type, or use case that may require specific items.

Examples: Beach, Camping, MTB, Hiking, Skiing.

| Field         | Type          | Required | Description                                      |
| ------------- | ------------- | -------- | ------------------------------------------------ |
| `id`          | UUID / string | Yes      | Unique activity identifier.                      |
| `name`        | string        | Yes      | Activity name.                                   |
| `description` | string        | No       | Optional explanation of the activity.            |
| `color`       | string        | No       | Display color, preferably stored as a HEX value. |
| `icon`        | string        | No       | Icon identifier, not the icon file itself.       |
| `created_at`  | datetime      | Yes      | Creation timestamp.                              |
| `updated_at`  | datetime      | Yes      | Last update timestamp.                           |

### Item Activities

Join table for the many-to-many relationship between items and activities.

One item can belong to multiple activities, and one activity can contain multiple items.

| Field         | Type          | Required | Description                   |
| ------------- | ------------- | -------- | ----------------------------- |
| `item_id`     | UUID / string | Yes      | Reference to `Items.id`.      |
| `activity_id` | UUID / string | Yes      | Reference to `Activities.id`. |
| `created_at`  | datetime      | Yes      | Creation timestamp.           |

Constraints:

- Primary key: composite key on `item_id` + `activity_id`
- `item_id` must reference an existing item
- `activity_id` must reference an existing activity
- The same item cannot be linked to the same activity more than once

### Packing Lists

A packing list is generated from the user's items and selected activities. An item is included when it is associated with at least one selected activity.

Example:

- Item: Sunscreen
- Activities: Beach, Hiking, Camping
- Selected activity: Beach
- Result: Sunscreen is included in the generated list

## Core User Flow

1. The user opens the app.
2. The app shows locally saved items and activities.
3. The user creates or edits items.
4. The user assigns each item to one or more activities.
5. The user selects one or more activities.
6. The app generates the list of items to bring.
7. The user uses the generated list as a checklist.

## MVP Scope

The first useful version should focus on:

- Creating, editing, deleting, and viewing items
- Creating, editing, deleting, and viewing activities
- Assigning items to one or more activities
- Filtering items by selected activities
- Generating a packing checklist
- Marking generated list entries as packed
- Persisting user data locally

## Future Ideas

These ideas are intentionally outside the first MVP unless explicitly prioritized:

- Saved custom packing lists
- Predefined starter lists
- Import/export
- PDF export
- Weight totals
- Item categories
- Optional account support
- Optional backup and sync

The following should not become requirements for the core app:

- Mandatory accounts
- Mandatory cloud sync
- Collaboration or social features
- Public profiles
- AI recommendations
- Travel itinerary planning
- Shopping or inventory management
- Subscriptions or payment flows
- Backend infrastructure for local-only packing features
