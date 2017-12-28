/* eslint-env jest */

import makeError from 'make-error'

import tryExpr from './'

const exceptionOf = fn => {
  try {
    throw fn()
  } catch (expection) {
    return expection
  }
}
const identity = value => value
const rejectFn = reason => () => Promise.reject(reason)
const throwFn = error => () => {
  throw error
}

describe('tryExpr(fn)', () => {
  it('forwards context and args to fn', () => {
    const spy = jest.fn()
    const context = 'foo'
    const args = [ 'bar', 'baz' ]

    tryExpr(spy).apply(context, args)

    expect(spy.mock.instances).toEqual([ context ])
    expect(spy.mock.calls).toEqual([ args ])
  })

  it('returns fn returned value', () => {
    expect(tryExpr(() => 'foo')()).toBe('foo')
  })

  it('catches errors', () => {
    expect(
      tryExpr(throwFn('foo')).catch(identity)()
    ).toBe('foo')
  })

  it('catches rejections', () =>
    tryExpr(rejectFn('foo')).catch(identity)().then(value =>
      expect(value).toBe('foo')
    )
  )

  it('catches errors matching a predicate', () => {
    const predicate = value => value === 'foo'

    expect(
      tryExpr(throwFn('foo')).catch(predicate, identity)()
    ).toBe('foo')

    expect(
      exceptionOf(tryExpr(throwFn('bar')).catch(predicate, identity))
    ).toBe('bar')
  })

  it('catches errors matching a class', () => {
    const CustomError1 = makeError('CustomError1')
    const CustomError2 = makeError('CustomError2')

    const error = new CustomError1()

    // The class itself.
    expect(
      tryExpr(throwFn(error)).catch(CustomError1, identity)()
    ).toBe(error)

    // A parent.
    expect(
      tryExpr(throwFn(error)).catch(Error, identity)()
    ).toBe(error)

    // Another class.
    expect(
      exceptionOf(tryExpr(throwFn(error)).catch(CustomError2, identity))
    ).toBe(error)
  })

  it('catches errors matching an object pattern', () => {
    const predicate = { foo: 0, bar: 1 }

    let value = { foo: 0, bar: 1, baz: 2 }
    expect(
      tryExpr(throwFn(value)).catch(predicate, identity)()
    ).toBe(value)

    value = { foo: 0, baz: 2 }
    expect(
      exceptionOf(tryExpr(throwFn(value)).catch(predicate, identity))
    ).toBe(value)

    value = { foo: 1, bar: 1 }
    expect(
      exceptionOf(tryExpr(throwFn(value)).catch(predicate, identity))
    ).toBe(value)
  })

  it('execute the first catch clause which matches', () => {
    expect(
      tryExpr(throwFn({ foo: 0, bar: 1 }))
        .catch(Error, () => 0)
        .catch({ foo: 0 }, () => 1)
        .catch(() => 2)()
    ).toBe(1)
  })
})
