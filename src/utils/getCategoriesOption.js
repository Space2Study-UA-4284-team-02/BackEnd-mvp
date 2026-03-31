const getCategoriesOptions = (categories) => {
  if (!categories) return undefined

  const categoriesArray = Array.isArray(categories) ? categories : [categories]

  const normalizedCategories = categoriesArray.map((item) => (item === 'null' ? null : item))
  if (normalizedCategories.length === 1) {
    return normalizedCategories[0]
  }
  return { $in: normalizedCategories }
}
module.exports = getCategoriesOptions
