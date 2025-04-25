import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { colors } from "../../styles/Themes";

const NoteBlock = ({ note, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedNote, setEditedNote] = useState({ ...note });
  const [selectedFont, setSelectedFont] = useState(note.fontFamily || "Arial");
  const contentEditableRef = useRef(null);
  const titleEditableRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [showMore, setShowMore] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const newContent = contentEditableRef.current.innerHTML;
    const newTitle = titleEditableRef.current.textContent;

    onUpdate({
      ...editedNote,
      title: newTitle,
      content: newContent,
      backgroundColor: editedNote.backgroundColor,
      fontFamily: selectedFont
    });
    setIsModalOpen(false);
  };

  const toggleStyle = (style, value) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const selectedNode = selection.anchorNode.parentNode;
    const hasStyle =
      (style === "fontWeight" && selectedNode.style.fontWeight === value) ||
      (style === "fontStyle" && selectedNode.style.fontStyle === value) ||
      (style === "textDecoration" &&
        selectedNode.style.textDecoration === value);

    if (hasStyle) {
      const span = document.createElement("span");
      span.style[style] = "";

      const rangeClone = range.cloneRange();
      const fragment = rangeClone.extractContents();
      processNodes(fragment, style);

      span.appendChild(fragment);
      range.insertNode(span);
    } else {
      const span = document.createElement("span");
      span.style[style] = value;
      range.surroundContents(span);
    }

    selection.removeAllRanges();
  };

  const processNodes = (parent, style) => {
    const childNodes = Array.from(parent.childNodes);
    childNodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.style && node.style[style]) {
          node.style[style] = "";
        }
        if (node.hasChildNodes()) {
          processNodes(node, style);
        }
      }
    });
  };

  const handleBold = () => toggleStyle("fontWeight", "bold");
  const handleItalic = () => toggleStyle("fontStyle", "italic");
  const handleUnderline = () => toggleStyle("textDecoration", "underline");

  const handleFontChange = (font) => {
    setSelectedFont(font);
    if (contentEditableRef.current) {
      contentEditableRef.current.style.fontFamily = font;
    }
  };

  const handleColorChange = (color) => {
    setEditedNote((prev) => ({ ...prev, color }));
  };

  useEffect(() => {
    if (isModalOpen) {
      setEditedNote({ ...note });
      setSelectedFont(note.fontFamily || "Arial");
    }
  }, [isModalOpen, note]);

  useEffect(() => {
    if (contentRef.current) {
      setShowMore(
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      );
    }
  }, [note.content]);

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.style.fontFamily = selectedFont;
    }
  }, [selectedFont]);

  return (
    <>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: note.backgroundColor || colors.primary,
          borderRadius: "8px",
          padding: "1rem",
          boxShadow: `0 2px 4px ${colors.secondary}`,
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem", color: colors.dark }}>
          {note.title}
        </h3>
        <div
          ref={contentRef}
          style={{
            color: colors.dark,
            whiteSpace: "pre-wrap",
            lineHeight: "1.5",
            fontFamily: note.fontFamily || "inherit",
            //fontFamily: "inherit",
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "150px",
          }}
          dangerouslySetInnerHTML={{ __html: note.content || "" }}
        />
        {showMore && (
          <div
            style={{
              alignSelf: "flex-end",
              marginTop: "0.5rem",
              color: colors.dark,
              fontWeight: "bold",
            }}
          >
            more...
          </div>
        )}
      </motion.div>

      {/* Modal for editing */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={overlayStyle}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              backgroundColor: editedNote.color || colors.primary,
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: `0 4px 8px ${colors.secondary}`,
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toolbar */}
            <div style={toolbarStyle}>
              <button onClick={handleBold} style={toolbarBtnStyle}><b>B</b></button>
              <button onClick={handleItalic} style={toolbarBtnStyle}><i>I</i></button>
              <button onClick={handleUnderline} style={toolbarBtnStyle}><u>U</u></button>
              <select
                value={selectedFont}
                onChange={(e) => handleFontChange(e.target.value)}
                style={{ ...toolbarBtnStyle, padding: "0.25rem 0.5rem", minWidth: "120px" }}
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
                {["#FFFFFF", "#E7F5FF", "#EBFBEE", "#FFF0F5", "#FFF9E6"].map(
                  (color) => (
                    <div
                      key={color}
                      onClick={() => handleColorChange(color)}
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: color,
                        borderRadius: "50%",
                        cursor: "pointer",
                        border: editedNote.color === color ? "2px solid white" : "none",
                      }}
                    />
                  )
                )}
              </div>
            </div>

            {/* Title and Content Editors */}
            <div
              ref={titleEditableRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                backgroundColor: "transparent",
                borderBottom: `1px solid ${colors.secondary}`,
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: colors.dark,
                outline: "none",
                padding: "0.5rem 0",
              }}
            >
              {editedNote.title}
            </div>

            <div
              ref={contentEditableRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                backgroundColor: "transparent",
                border: "none",
                resize: "none",
                flexGrow: 1,
                color: colors.dark,
                outline: "none",
                minHeight: "300px",
                fontSize: "1rem",
                whiteSpace: "pre-wrap",
                lineHeight: "1.5",
                fontFamily: selectedFont || "Arial",
              }}
              dangerouslySetInnerHTML={{ __html: editedNote.content }}
            />

            {/* Footer Buttons */}
            <div style={footerStyle}>
              <button onClick={() => setShowDeleteConfirm(true)} style={actionBtnStyle("#FF3333", "white")}>
                Delete
              </button>
              <button onClick={() => setIsModalOpen(false)} style={actionBtnStyle(colors.secondary, colors.dark)}>
                Cancel
              </button>
              <button onClick={handleSave} style={actionBtnStyle(colors.primary, colors.dark)}>
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={overlayStyle}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "400px",
              width: "100%",
              boxShadow: `0 4px 10px rgba(0,0,0,0.2)`,
            }}
          >
            <p style={{ marginBottom: "1.5rem", color: colors.dark }}>
              Are you sure you want to delete this note?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={actionBtnStyle("#ccc", "#000")}>
                Cancel
              </button>
              <button onClick={onDelete} style={actionBtnStyle("#FF3333", "#fff")}>
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// Reusable styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "1rem",
};

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  borderBottom: `1px solid #ccc`,
  paddingBottom: "0.5rem",
};

const toolbarBtnStyle = {
  backgroundColor: "transparent",
  border: "1px solid #ddd",
  padding: "0.5rem",
  cursor: "pointer",
  borderRadius: "4px",
  fontSize: "1.1rem",
};

const actionBtnStyle = (bgColor, textColor) => ({
  backgroundColor: bgColor,
  color: textColor,
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontSize: "1rem",
});

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
  borderTop: `1px solid #ccc`,
  paddingTop: "1rem",
};

export default NoteBlock;
