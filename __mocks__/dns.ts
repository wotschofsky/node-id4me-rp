exports.resolveTxt = (
  hostname: string,
  callback: (err: NodeJS.ErrnoException | null, addresses: string[][]) => void
): void => {
  const splitHostname = hostname.split('.');
  if (splitHostname.length > 3) {
    const error = new Error(`Error: queryTxt ENODATA _openid.${hostname}`);
    callback(error, []);
  } else if (splitHostname.length > 2) {
    callback(null, [['iss=id.test.denic.de;clp=identityagent.de']]);
  } else {
    callback(null, [['v=OID1;iss=id.test.denic.de;clp=identityagent.de']]);
  }
};
