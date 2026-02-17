SELECT 
    id, 
    title, 
    price,
    format,
    isAvailable,
    stockQuantity
FROM books
ORDER BY "createdAt" DESC;
