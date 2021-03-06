const { hasOwnProperty } = Object.prototype
const matchError = (predicate, error) => {
  if (typeof predicate === 'function') {
    return (
      predicate === Error ||
      predicate.prototype instanceof Error
    )
      ? error instanceof predicate
      : predicate(error)
  }

  if (error != null && typeof predicate === 'object') {
    for (const key in predicate) {
      if (
        hasOwnProperty.call(predicate, key) &&
        error[key] !== predicate[key]
      ) {
        return false
      }
    }
    return true
  }
}

const { push } = Array.prototype
function addCatchClause () {
  const args = []
  push.apply(args, arguments)
  this.catchClauses.push(args)
  return this
}

function dispatch (catchClauses, error) {
  for (let i = 0, n = catchClauses.length; i < n; ++i) {
    const catchClause = catchClauses[i]
    const m = catchClause.length - 1

    // no predicates, inconditional match
    if (m === 0) {
      return catchClause[m](error)
    }

    for (let j = 0; j < m; ++j) {
      if (matchError(catchClause[j], error)) {
        return catchClause[m](error)
      }
    }
  }

  // no clauses matched, rethrow
  throw error
}

const tryExpr = fn => {
  const boundDispatch = error => dispatch(catchClauses, error)

  const exec = fn === undefined
    // if no try function passed, simply match clauses with the first
    // arg
    ? boundDispatch
    : function () {
      try {
        const result = fn.apply(this, arguments)
        let then
        return (result != null && typeof (then = result.then) === 'function')
          ? then.call(result, undefined, boundDispatch)
          : result
      } catch (error) {
        return dispatch(catchClauses, error)
      }
    }
  const catchClauses = exec.catchClauses = []
  exec.caught = exec.catch = addCatchClause
  return exec
}
export { tryExpr as default }
