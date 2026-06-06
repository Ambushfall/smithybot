const data = require('../normalized-data.json');

// Pre-build index for ID lookups (Run this once at startup)
const idToRecipeWpn = {};
const idToRecipeFd = {};
Object.entries(data.weapons).forEach(([_, recipe]) => idToRecipeWpn[recipe.id] = { ...recipe, type: 'weapon' });
Object.entries(data.food).forEach(([_, recipe]) => idToRecipeFd[recipe.id] = { ...recipe, type: 'food' });

// Recursive function to get full material tree
function getFullRecipe(recipeId, type) {

    const rootRecipe = type == "weapon" ? idToRecipeWpn[recipeId] : idToRecipeFd[recipeId];
    if (!rootRecipe) return null;

    const resolveMaterials = (mats) => {
        return mats.map(m => {
            const item = data.items[m.item_id];
            const subRecipe = data.weapons[m.item_id] || data.food[m.item_id];

            return {
                name: item.name,
                amount: m.amount,
                isCraftable: !!subRecipe,
                // Recursively fetch sub-materials if they exist
                subMaterials: subRecipe ? resolveMaterials(subRecipe.materials) : []
            };
        });
    };

    return {
        ...rootRecipe,
        materials: resolveMaterials(rootRecipe.materials)
    };
}

function getFlattenedRecipeChain(recipeId, type) {
    const rootRecipe = type == "weapons" ? idToRecipeWpn[recipeId] : idToRecipeFd[recipeId];
    if (!rootRecipe) return null;

    const chain = [];

    // Helper to traverse the tree and collect all craftable steps
    function collectCraftables(recipe) {
        // Add this recipe to the chain
        chain.push(recipe);

        // Look for sub-materials that are also craftable recipes
        recipe.materials.forEach(m => {
            const subRecipe = data.weapons[m.item_id] || data.food[m.item_id];
            if (subRecipe) {
                collectCraftables(subRecipe);
            }
        });
    }

    collectCraftables(rootRecipe);
    return chain; // Returns [Root, Sub1, Sub2...]
}

module.exports = { getFullRecipe, getFlattenedRecipeChain };