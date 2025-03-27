import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "@mdxeditor/editor/style.css";

const MarkdownEditor = ({ id, value, onChange, readOnly }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setMarkdown(value);
    }
  }, [value]);
  return (
    <div id={id} className="w-full border border-gray-300 rounded-md">
      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        readOnly={readOnly}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          diffSourcePlugin(),
          toolbarPlugin({
            toolbarContents: () =>
              !readOnly && (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <DiffSourceToggleWrapper
                    options={["source", "rendered"]}
                  ></DiffSourceToggleWrapper>
                </>
              ),
          }),
        ]}
      />
    </div>
  );
};
MarkdownEditor.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default MarkdownEditor;
