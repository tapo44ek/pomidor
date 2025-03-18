import React from "react";
import { PotborIcon } from "../../PloshadkiTable/Table/Icons";

export default function StatusCell( props ) {
  const value = props['props']
  
  return (
    <div className="flex flex-row justify-start items-center gap-2 min-w-[204px] flex-wrap p-4 w-full">
        <PotborIcon potbor={value['status']} />
        <div className="flex flex-col justify-center items-start gap-0 w-[140px] text-left flex-wrap text-sm">
            <div className="w-full truncate">{value['status'] ? value['status'] : 'Не подобрано'}</div>
        </div>
    </div>
  );
  } 