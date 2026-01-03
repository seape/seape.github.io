import { visit } from 'unist-util-visit';

export function remarkContainers() {
  return (tree, file) => {

    // 首先检查是否有多行容器语法（开始和结束在同一段落）
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!node.children || node.children.length === 0) return;

      const firstChild = node.children[0];
      if (firstChild.type !== 'text') return;

      const fullText = firstChild.value;

      // 检查是否是完整的容器语法在同一段落中
      const completeContainerMatch = fullText.match(/^::: (tip|note|warning|danger|info|details)([^]*?):::$/s);
      if (completeContainerMatch) {
        const [, type, content] = completeContainerMatch;
        const lines = content.trim().split('\n');
        const customTitle = lines.length > 0 ? lines[0].trim() : '';
        const title = customTitle || getDefaultTitle(type);

        // 内容是第一行之后的所有内容
        const contentText = lines.slice(1).join('\n').trim();

        // 创建HTML容器
        const htmlContent = `<div class="container-${type} custom-container" data-container-type="${type}">
<div class="container-title">${title}</div>
<div class="container-content">
<p>${contentText.replace(/\n/g, '</p>\n<p>')}</p>
</div>
</div>`;

        const htmlNode = {
          type: 'html',
          value: htmlContent
        };

        // 替换当前段落
        parent.children[index] = htmlNode;
        return;
      }

      // 检查是否匹配容器开始语法
      const containerMatch = firstChild.value.match(/^::: (tip|note|warning|danger|info|details)(.*)$/);
      if (containerMatch) {
        const [, type, titlePart] = containerMatch;
        const customTitle = titlePart ? titlePart.trim() : '';
        const title = customTitle || getDefaultTitle(type);

        // 检查是否这个段落只包含开始标签（常见于有空行分隔的情况）
        const isOnlyStartTag = firstChild.value.trim() === `:::${type}${titlePart}`.trim() ||
                              firstChild.value.trim() === `::: ${type}${titlePart}`.trim();

        // 寻找结束标记，包括检查文本节点内的结束标记
        let endIndex = -1;
        const siblings = parent.children;

        // 如果是独立的开始标签，跳过紧接着的空段落
        let searchStart = index + 1;
        if (isOnlyStartTag && searchStart < siblings.length) {
          const nextNode = siblings[searchStart];
          // 如果下一个节点是空段落，跳过它
          if (nextNode.type === 'paragraph' &&
              (!nextNode.children || nextNode.children.length === 0 ||
               (nextNode.children.length === 1 &&
                nextNode.children[0].type === 'text' &&
                nextNode.children[0].value.trim() === ''))) {
            searchStart++;
          }
        }

        for (let i = searchStart; i < siblings.length; i++) {
          const sibling = siblings[i];

          // 检查段落类型中是否有结束标记
          if (sibling.type === 'paragraph' &&
              sibling.children &&
              sibling.children.length > 0 &&
              sibling.children[0] &&
              sibling.children[0].type === 'text') {

            const textValue = sibling.children[0].value;

            // 检查是否包含结束标记
            if (textValue.includes(':::')) {
              endIndex = i + 1; // 不包含这个段落

              // 如果结束标记不是独立的，需要分割内容
              if (textValue.trim() !== ':::') {
                const parts = textValue.split(':::');
                if (parts.length >= 2) {
                  // 第一部分作为内容，清理后面的部分
                  sibling.children[0].value = parts[0].trimEnd();
                  if (sibling.children[0].value === '') {
                    // 如果第一部分是空的，移除这个段落
                    endIndex = i;
                  }
                }
              }
              break;
            }
          }

          // 检查列表中是否包含结束标记
          if (sibling.type === 'list') {
            let foundClosing = false;

            // 检查列表的最后一项是否包含:::
            const lastItem = sibling.children[sibling.children.length - 1];
            if (lastItem && lastItem.children && lastItem.children.length > 0) {
              const lastParagraph = lastItem.children[lastItem.children.length - 1];
              if (lastParagraph && lastParagraph.type === 'paragraph' && lastParagraph.children && lastParagraph.children.length > 0) {
                const lastText = lastParagraph.children[lastParagraph.children.length - 1];
                if (lastText && lastText.type === 'text') {
                  if (lastText.value.includes(':::')) {
                    endIndex = i + 1; // 包含这个列表

                    // 清理文本节点中的结束标记
                    const parts = lastText.value.split(':::');
                    lastText.value = parts[0].trimEnd();
                    foundClosing = true;
                  }
                }
              }
            }
            if (foundClosing) break;
          }
        }

        if (endIndex === -1) {
          // 如果找不到结束标记，找到下一个容器或者文档末尾
          for (let i = index + 1; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling.type === 'paragraph' &&
                sibling.children &&
                sibling.children[0] &&
                sibling.children[0].type === 'text' &&
                sibling.children[0].value.match(/^::: (tip|note|warning|danger|info|details)/)) {
              endIndex = i;
              break;
            }
          }

          // 如果还是没找到，就到文档末尾
          if (endIndex === -1) {
            endIndex = siblings.length;
          }
        }

        // 收集中间的内容，从正确的起始位置开始
        const contentNodes = siblings.slice(searchStart, endIndex);

        // 创建HTML容器
        const openingHTML = `<div class="container-${type} custom-container" data-container-type="${type}">
<div class="container-title">${title}</div>
<div class="container-content">`;

        const closingHTML = `</div>
</div>`;

        const htmlNode = {
          type: 'html',
          value: openingHTML
        };

        const closeNode = {
          type: 'html',
          value: closingHTML
        };

        // 替换节点 - 需要考虑可能跳过的空段落
        const replaceCount = endIndex - index;
        const newNodes = [htmlNode, ...contentNodes, closeNode];
        siblings.splice(index, replaceCount, ...newNodes);

        return index + newNodes.length;
      }
    });
  };
}

function getDefaultTitle(containerType) {
  const titles = {
    tip: '💡 提示',
    note: '📝 注意',
    warning: '⚠️ 警告',
    danger: '🚨 危险',
    info: 'ℹ️ 信息',
    details: '📋 详情'
  };

  return titles[containerType] || containerType.toUpperCase();
}