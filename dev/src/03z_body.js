/* shared geometry cache */
const GEO={};
function G(key,fn){return GEO[key]||(GEO[key]=fn());}
