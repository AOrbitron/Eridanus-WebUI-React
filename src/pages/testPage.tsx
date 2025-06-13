
import React, { useState, useEffect } from 'react';

function testPage() {
  // 存储原始数据
  const [originalData, setOriginalData] = useState({});
  // 存储解析后的数据
  const [parsedData, setParsedData] = useState([]);
  // 存储错误信息
  const [error, setError] = useState(null);

  // 示例数据 - 实际应用中可能来自API或props
  const sampleData = {
    "data": [
      [
        "{\"role\": \"start\", \"msg_id\": 1749731113, \"message\": {\"action\": \"send_group_msg\", \"params\": {\"group_id\": 879886836, \"message\": [{\"type\": \"text\", \"data\": {\"text\": \"\\u55b5\\u545c\\uff0c\\u4e3b\\u4eba\\u5927\\u4eba\\uff01Eridanus\\u5728\\u8fd9\\u91cc\\uff0c\\u968f\\u65f6\\u542c\\u5019\\u60a8\\u7684\\u6307\\u6325\\u5462\\u3002\\u4e0d\\u77e5\\u9053\\u4e3b\\u4eba\\u6709\\u4ec0\\u4e48\\u60f3\\u8ba9\\u6211\\u505a\\u7684\\u4e8b\\u60c5\\u5417\\uff1f\\u8bf7\\u968f\\u610f\\u5429\\u5490\\u55b5\\uff01\"}}]}, \"echo\": \"0ad2a5e9-7ed9-49d1-875f-119ad35f9f4a\"}}"
      ],
      [
        "{\"role\": \"end\", \"msg_id\": 1749731109562, \"message\": [{\"type\": \"at\", \"data\": {\"qq\": \"1000000\", \"name\": \"Eridanus\"}}, {\"type\": \"text\", \"data\": {\"text\": \"2\"}}]}"
      ]
    ]
  };

  useEffect(() => {
    // 设置原始数据
    setOriginalData(sampleData);

    try {
      // 解析主数据
      if (sampleData.data && Array.isArray(sampleData.data)) {
        const parsedResults = sampleData.data.map((subArray, index) => {
          // 确保子数组存在且只有一个元素
          if (Array.isArray(subArray) && subArray.length === 1) {
            const jsonString = subArray[0];

            try {
              // 解析JSON字符串
              const parsedJson = JSON.parse(jsonString);
              return {
                index,
                originalString: jsonString,
                parsedData: parsedJson
              };
            } catch (parseError) {
              console.error(`解析第 ${index} 项时出错:`, parseError);
              return {
                index,
                originalString: jsonString,
                error: parseError.message
              };
            }
          }

          return {
            index,
            error: '子数组格式不正确或元素数量不为1'
          };
        });

        setParsedData(parsedResults);
      } else {
        setError('数据格式不正确，缺少data数组或格式错误');
      }
    } catch (error) {
      setError(`处理数据时出错: ${error.message}`);
    }
  }, [sampleData]);

  return (
    <div className="json-parser">
      <h2>JSON数据解析器</h2>

      {error && (
        <div className="error-message">
          <strong>错误:</strong> {error}
        </div>
      )}

      <div className="data-summary">
        <h3>原始数据摘要</h3>
        <pre>{JSON.stringify(originalData, null, 2)}</pre>
      </div>

      <div className="parsed-results">
        <h3>解析结果</h3>
        {parsedData.length > 0 ? (
          <ul>
            {parsedData.map(item => (
              <li key={item.index} className="result-item">
                <h4>第 {item.index + 1} 项</h4>
                <div className="original-string">
                  <strong>原始字符串:</strong> {item.originalString}
                </div>

                {item.error ? (
                  <div className="parse-error">
                    <strong>解析错误:</strong> {item.error}
                  </div>
                ) : (
                  <div className="parsed-json">
                    <strong>解析后的数据:</strong>
                    <pre>{JSON.stringify(item.parsedData, null, 2)}</pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>没有可显示的解析结果</p>
        )}
      </div>
    </div>
  );
}

export default testPage;
