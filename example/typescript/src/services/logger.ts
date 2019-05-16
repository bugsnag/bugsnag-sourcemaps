export function debug (...args: any[]) {
  console.debug(new Date(), ...args)
}
export function info (...args: any[]) {
  console.info(new Date(), ...args)
}
export function warn (...args: any[]) {
  console.warn(new Date(), ...args)
}
export function error (...args: any[]) {
  console.error(new Date(), ...args)
}

export default { debug, info, warn, error }
