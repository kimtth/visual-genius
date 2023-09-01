import React, { useCallback } from "react";
import dynamic from 'next/dynamic';
import PhotoCard from "../imgcard/photoCard";
import { useDispatch } from "react-redux";
import { setImageDataPayload } from "../state/datas";


const Container = ({ children }: any) => (
  <div style={{ display: "flex" }}>{children}</div>
);

const DragDropContext = dynamic(
  async () => {
    const mod = await import('react-beautiful-dnd');
    return mod.DragDropContext;
  },
  { ssr: false },
);

const Droppable = dynamic(
  async () => {
    const mod = await import('react-beautiful-dnd');
    return mod.Droppable;
  },
  { ssr: false },
);

const DragDropBoard = ({ dataPayload }: any) => {
  const dispatch = useDispatch();
  const onDataPayload = useCallback(
    (any: any) => dispatch(setImageDataPayload(any)),
    [dispatch]
  );

  const onDragEnd = (result: any, columns: any, setColumns: any) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };
  return (
    // <NoSSR>
    <DragDropContext
      onDragEnd={(result) => onDragEnd(result, dataPayload, onDataPayload)}
    >
      <Container>
        {Object.entries(dataPayload)?.map(([columnId, column]: [string, any], index) => {
          return (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {column.items.map((item: any, index: any) => (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      index={index}
                      imgPath={item.imgPath}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </Container>
    </DragDropContext>
    // </NoSSR>
  );
};

// https://github.com/atlassian/react-beautiful-dnd/issues/1854
// https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/
// https://stackoverflow.com/questions/59941273/learning-react-beautiful-dnd-basics-without-building-trello-clone
export default DragDropBoard;
