/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'types-no-react',
      comment: 'src/types.ts must stay framework free.',
      severity: 'error',
      from: { path: '^src/types\\.ts$' },
      to: { path: '(^|/)node_modules/(react|react-dom)(/|$)' },
    },
    {
      name: 'types-no-ui-or-state',
      severity: 'error',
      from: { path: '^src/types\\.ts$' },
      to: { path: '^src/(components|state)/' },
    },
    {
      name: 'domain-no-react',
      comment: 'src/domain must be pure logic, no React.',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { path: '(^|/)node_modules/(react|react-dom)(/|$)' },
    },
    {
      name: 'domain-no-ui-or-state',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { path: '^src/(components|state)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default'] },
  },
};
