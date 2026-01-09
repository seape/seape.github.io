import { n as createVNode, F as Fragment, _ as __astro_tag_component__ } from './astro/server.CsXMQSOf.js';
import 'clsx';

const frontmatter = {
  "title": "关于",
  "description": "容我考虑下写些什么"
};
function getHeadings() {
  return [];
}
function _createMdxContent(props) {
  return createVNode(Fragment, {});
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent();
}

const url = "/about";
const file = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/pages/about.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/pages/about.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
