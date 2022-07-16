---
created: 2022-07-16T11:28:19 (UTC +07:00)
tags: []
source: https://medium.com/sessionstack-blog/how-javascript-works-the-internals-of-shadow-dom-how-to-build-self-contained-components-244331c4de6e
author: Alexander Zlatkov
---

# Cách hoạt động của JavaScript: nội bộ của Shadow DOM + cách xây dựng các thành phần độc lập | bởi Alexander Zlatkov | Blog SessionStack

> ## Excerpt
> This is post # 17 of the series dedicated to exploring JavaScript and its building components. In the process of identifying and describing the core elements, we also share some rules of thumb we use…

---
## Cách JavaScript hoạt động: nội bộ của Shadow DOM + cách xây dựng các thành phần độc lập

![](https://miro.medium.com/max/700/0*66kSmyuCNeD7Oiaq)

Đây là bài đăng số 17 của loạt bài dành riêng cho việc khám phá JavaScript và các thành phần xây dựng của nó. Trong quá trình xác định và mô tả các yếu tố cốt lõi, chúng tôi cũng chia sẻ một số quy tắc chung mà chúng tôi sử dụng khi xây dựng [SessionStack](https://www.sessionstack.com/?utm_source=medium&utm_medium=blog&utm_content=js-series-parsing-intro) , một ứng dụng JavaScript cần phải mạnh mẽ và có hiệu suất cao để giúp người dùng xem và tái tạo các lỗi ứng dụng web của họ theo thời gian thực.

Nếu bạn bỏ lỡ các chương trước, bạn có thể tìm thấy chúng tại đây:

-   [Tổng quan về công cụ, thời gian chạy và ngăn xếp cuộc gọi](https://blog.sessionstack.com/how-does-javascript-actually-work-part-1-b0bacc073cf?source=collection_home---2------1----------------)
-   [Bên trong công cụ V8 của Google + 5 mẹo về cách viết mã được tối ưu hóa](https://blog.sessionstack.com/how-javascript-works-inside-the-v8-engine-5-tips-on-how-to-write-optimized-code-ac089e62b12e?source=collection_home---2------2----------------)
-   [Quản lý bộ nhớ + cách xử lý 4 lỗi rò rỉ bộ nhớ phổ biến](https://blog.sessionstack.com/how-javascript-works-memory-management-how-to-handle-4-common-memory-leaks-3f28b94cfbec?source=collection_home---2------0----------------)
-   [Vòng lặp sự kiện và sự phát triển của lập trình Async + 5 cách để mã hóa tốt hơn với async / await](https://blog.sessionstack.com/how-javascript-works-event-loop-and-the-rise-of-async-programming-5-ways-to-better-coding-with-2f077c4438b5)
-   [Tìm hiểu sâu về WebSockets và HTTP / 2 với SSE + cách chọn đúng đường](https://blog.sessionstack.com/how-javascript-works-deep-dive-into-websockets-and-http-2-with-sse-how-to-pick-the-right-path-584e6b8e3bf7?source=collection_home---4------0----------------)
-   [So sánh với WebAssembly + tại sao trong một số trường hợp nhất định, tốt hơn nên sử dụng nó thay vì JavaScript](https://blog.sessionstack.com/how-javascript-works-a-comparison-with-webassembly-why-in-certain-cases-its-better-to-use-it-d80945172d79)
-   [Các khối xây dựng của Web worker + 5 trường hợp bạn nên sử dụng chúng](https://blog.sessionstack.com/how-javascript-works-the-building-blocks-of-web-workers-5-cases-when-you-should-use-them-a547c0757f6a)
-   [Nhân viên dịch vụ, vòng đời của họ và các trường hợp sử dụng](https://blog.sessionstack.com/how-javascript-works-service-workers-their-life-cycle-and-use-cases-52b19ad98b58)
-   [Cơ chế của Thông báo đẩy trên web](https://blog.sessionstack.com/how-javascript-works-the-mechanics-of-web-push-notifications-290176c5c55d)
-   [Theo dõi các thay đổi trong DOM bằng cách sử dụng MutationObserver](https://blog.sessionstack.com/how-javascript-works-tracking-changes-in-the-dom-using-mutationobserver-86adc7446401)
-   [Công cụ kết xuất và các mẹo để tối ưu hóa hiệu suất của nó](https://blog.sessionstack.com/how-javascript-works-the-rendering-engine-and-tips-to-optimize-its-performance-7b95553baeda)
-   [Bên trong lớp mạng + Cách tối ưu hóa hiệu suất và bảo mật của nó](https://blog.sessionstack.com/how-javascript-works-inside-the-networking-layer-how-to-optimize-its-performance-and-security-f71b7414d34c)
-   [Giới thiệu về hoạt ảnh CSS và JS + cách tối ưu hóa hiệu suất của chúng](https://blog.sessionstack.com/how-javascript-works-under-the-hood-of-css-and-js-animations-how-to-optimize-their-performance-db0e79586216)
-   [Phân tích cú pháp, Cây cú pháp tóm tắt (AST) + 5 mẹo về cách giảm thiểu thời gian phân tích cú pháp](https://blog.sessionstack.com/how-javascript-works-parsing-abstract-syntax-trees-asts-5-tips-on-how-to-minimize-parse-time-abfcf7e8a0c8)
-   [Nội bộ của các lớp và kế thừa + chuyển dịch trong Babel và TypeScript](https://blog.sessionstack.com/how-javascript-works-the-internals-of-classes-and-inheritance-transpiling-in-babel-and-113612cdc220)
-   [Công cụ lưu trữ + cách chọn API lưu trữ thích hợp](https://blog.sessionstack.com/how-javascript-works-storage-engines-how-to-choose-the-proper-storage-api-da50879ef576)

## Tổng quan

Web Components là một bộ các công nghệ khác nhau cho phép bạn tạo các phần tử tùy chỉnh có thể tái sử dụng. Chức năng của chúng được gói gọn khỏi phần còn lại của mã và bạn có thể sử dụng chúng trong các ứng dụng web của mình.

Có 4 tiêu chuẩn Thành phần Web:

-   Shadow DOM
-   Mẫu HTML
-   Các yếu tố tùy chỉnh
-   Nhập HTML

Trong bài viết này, chúng tôi sẽ tập trung vào **Shadow DOM** .

Shadow DOM được thiết kế như một công cụ để xây dựng các ứng dụng dựa trên thành phần. Nó cung cấp các giải pháp cho các vấn đề phổ biến trong phát triển web mà bạn có thể đã trải qua:

-   **DOM biệt lập** : DOM của một thành phần là tự chứa (ví dụ: `document.querySelector()`sẽ không trả về các nút trong DOM bóng của thành phần). Điều này cũng đơn giản hóa các bộ chọn CSS trên ứng dụng web của bạn vì các thành phần DOM được tách biệt và nó cung cấp cho bạn khả năng sử dụng nhiều tên id / lớp chung hơn mà không phải lo lắng về xung đột đặt tên.
-   **CSS** có phạm vi: CSS được định nghĩa bên trong Shadow DOM được xác định phạm vi. Quy tắc kiểu không bị rò rỉ ra ngoài và kiểu trang không can thiệp vào nó.
-   **Thành phần** : Thiết kế một API dựa trên khai báo, đánh dấu cho thành phần của bạn.

Bài viết này giả định rằng bạn đã quen thuộc với khái niệm DOM và các API của nó. Nếu không, bạn có thể đọc bài viết chi tiết về nó tại đây - [https://developer.mozilla.org/en-US/docs/Web/API/Document\_Object\_Model/Introduction](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) .

Shadow DOM chỉ là một DOM bình thường ngoại trừ hai điểm khác biệt:

-   Cách nó được tạo / sử dụng liên quan đến phần còn lại của trang so với wah bạn tạo và sử dụng DOM
-   Nó hoạt động như thế nào so với phần còn lại của trang

Nói chung, bạn tạo các nút DOM và nối chúng dưới dạng phần tử con vào một phần tử khác. Trong trường hợp Shadow DOM, bạn tạo một cây DOM có phạm vi được gắn vào phần tử nhưng nó tách biệt với các phần tử con thực tế của nó. Cây con có phạm vi này được gọi là **cây bóng tối** . Phần tử mà nó được gắn vào là **máy chủ bóng** . Bất kỳ thứ gì bạn thêm vào cây bóng tối sẽ trở thành cục bộ đối với phần tử lưu trữ, bao gồm `<style>`. Đây là cách Shadow DOM đạt được phạm vi kiểu CSS.

## Tạo Shadow DOM

là **Gốc bóng** một đoạn tài liệu được gắn vào phần tử “máy chủ”. Thời điểm bạn đính kèm một gốc bóng tối là khi phần tử nhận được DOM bóng của nó. Để tạo DOM bóng cho một phần tử, hãy gọi `element.attachShadow()`:

Đặc [tả](http://w3c.github.io/webcomponents/spec/shadow/#h-methods) xác định danh sách các phần tử không thể lưu trữ cây bóng.

## Thành phần trong Shadow DOM

Thành phần là một trong những tính năng quan trọng nhất của Shadow DOM.

Khi viết HTML, bố cục là cách bạn xây dựng ứng dụng web của mình. Bạn kết hợp và lồng các khối xây dựng (phần tử) khác nhau, chẳng hạn như `<div>`, `<header>`, `<form>`và những thứ khác để xây dựng giao diện người dùng bạn cần cho ứng dụng web của mình. Một số thẻ này thậm chí còn hoạt động với nhau.

Thành phần xác định lý do tại sao các phần tử như `<select>`, `<form>`, `<video>`và những người khác linh hoạt và chấp nhận các phần tử HTML cụ thể khi còn nhỏ để làm điều gì đó đặc biệt với chúng.

Ví dụ, `<select>`biết cách kết xuất `<option>`thành một tiện ích con thả xuống với các mục được xác định trước.

Shadow DOM giới thiệu các tính năng sau đây có thể được sử dụng để đạt được thành phần.

## DOM nhẹ

Đây là đánh dấu mà người dùng thành phần của bạn viết. DOM này nằm ngoài DOM bóng của thành phần. Nó là con thực tế của phần tử. Hãy tưởng tượng rằng bạn đã tạo một thành phần tùy chỉnh có tên là `<better-button>`mở rộng nút HTML gốc và bạn muốn thêm hình ảnh và một số văn bản bên trong nó. Đây là cách nó trông như thế này:

“Nút mở rộng” là thành phần tùy chỉnh mà bạn đã xác định, trong khi HTML bên trong nó được gọi là Light DOM và được thêm bởi người dùng thành phần của bạn.

Shadow DOM ở đây là thành phần bạn đã tạo (“nút mở rộng”). Shadow DOM là cục bộ của thành phần và xác định cấu trúc bên trong của nó, CSS phạm vi và đóng gói các chi tiết triển khai của bạn.

## Cây DOM dẹt

Kết quả của việc trình duyệt phân phối DOM nhẹ, được người dùng tạo vào DOM bóng của bạn và đã xác định thành phần tùy chỉnh của bạn, hiển thị sản phẩm cuối cùng. Cây dẹt là những gì cuối cùng bạn nhìn thấy trong DevTools và những gì được hiển thị trên trang.

## Mẫu

Khi bạn phải sử dụng lại nhiều lần các cấu trúc đánh dấu giống nhau trên một trang web, tốt hơn nên sử dụng một số loại mẫu hơn là lặp đi lặp lại cùng một cấu trúc. Điều này có thể xảy ra trước đây, nhưng nó được thực hiện dễ dàng hơn nhiều bởi phần tử HTML <template> (được hỗ trợ tốt trong các trình duyệt hiện đại). Phần tử này và nội dung của nó không được hiển thị trong DOM nhưng nó vẫn có thể được tham chiếu bằng JavaScript.

Hãy xem xét một ví dụ đơn giản nhanh chóng:

Điều này sẽ không xuất hiện trong trang của bạn cho đến khi bạn tham chiếu nó bằng JavaScript và sau đó nối nó vào DOM bằng cách sử dụng một cái gì đó như sau:

Cho đến bây giờ đã có những kỹ thuật khác để đạt được hành vi tương tự, nhưng, như đã đề cập trước đó, thật tuyệt khi điều này được bảo vệ nguyên bản. Nó cũng có hỗ trợ trình duyệt khá tốt:

![](https://miro.medium.com/max/700/0*3SRCEtv7rMhWpB5s)

Bản thân các mẫu hữu ích nhưng chúng hoạt động tốt hơn với các yếu tố tùy chỉnh. Chúng tôi sẽ xác định các phần tử tùy chỉnh trong một bài đăng khác của loạt bài này, hiện tại bạn nên biết rằng API \`customElement\` trong trình duyệt cho phép bạn xác định các thẻ của riêng mình với kết xuất tùy chỉnh.

Hãy xác định một thành phần web sử dụng mẫu của chúng ta làm nội dung của DOM bóng của nó. Chúng tôi sẽ gọi nó `<my-paragraph>`:

Điểm quan trọng cần lưu ý ở đây là chúng tôi đã thêm một bản sao của nội dung mẫu vào gốc bóng tối, được tạo bằng cách sử dụng `[Node.cloneNode()](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode)`phương pháp.

Và bởi vì chúng tôi đang thêm nội dung của nó vào một DOM bóng, chúng tôi có thể bao gồm một số thông tin tạo kiểu bên trong mẫu trong một `[<style>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style)`, sau đó được đóng gói bên trong phần tử tùy chỉnh. Điều này sẽ không hoạt động nếu chúng tôi chỉ thêm nó vào DOM tiêu chuẩn.

Ví dụ: chúng ta có thể thay đổi mẫu của mình thành như sau:

Bây giờ thành phần tùy chỉnh mà chúng tôi đã xác định với mẫu của chúng tôi có thể được sử dụng như sau:  
`<my-paragraph></my-paragraph>`

## Slots

Các mẫu có một vài nhược điểm, nhược điểm chính là nội dung tĩnh không cho phép chúng tôi hiển thị các biến / dữ liệu của mình để làm cho nó hoạt động theo cách các mẫu HTML tiêu chuẩn mà bạn thường làm.

Đây là nơi `<slot>`đi vào hình ảnh.

Bạn có thể coi các vị trí như các trình giữ chỗ cho phép bạn đặt HTML của riêng mình vào mẫu. Điều này cho phép bạn tạo các mẫu HTML chung và sau đó làm cho chúng có thể tùy chỉnh bằng cách thêm các vị trí.

Hãy xem mẫu trên sẽ trông như thế nào với một vị trí:

Nếu nội dung của vị trí không được xác định khi phần tử được bao gồm trong đánh dấu hoặc nếu trình duyệt không hỗ trợ vị trí, `<my-paragraph>`sẽ chỉ chứa nội dung dự phòng "Văn bản mặc định".

Để xác định nội dung của vị trí, chúng ta nên bao gồm cấu trúc HTML bên trong `<my-paragraph>`phần tử có [vị trí](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-slot) có giá trị bằng tên của vị trí mà chúng ta muốn nó lấp đầy.

Như trước đây, đây có thể là bất kỳ thứ gì bạn thích:

Các phần tử có thể được chèn vào các khe được gọi là [Slotable](https://developer.mozilla.org/en-US/docs/Web/API/Slotable) ; khi một phần tử đã được chèn vào một rãnh, nó được cho là _có rãnh_ .

Lưu ý rằng trong ví dụ trên, chúng tôi đã chèn một `<span>`phần tử là phần tử có rãnh. Nó có một thuộc tính \`slot\` tương đương với“ my-text ”giống với giá trị của thuộc tính\` name\` trong định nghĩa vị trí của mẫu.

Sau khi được hiển thị trong trình duyệt, đoạn mã trên sẽ tạo cây DOM phẳng sau:

Lưu ý `#shadow-root`phần tử - nó chỉ là một chỉ báo cho thấy Shadow DOM tồn tại.

## Tạo kiểu

Một thành phần sử dụng Shadow DOM có thể được tạo kiểu bởi trang chính, có thể xác định kiểu riêng của nó hoặc cung cấp các móc ở dạng [thuộc tính tùy chỉnh CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) để người dùng ghi đè các giá trị mặc định.

## Các kiểu do thành phần xác định

**CSS** theo phạm vi là một trong những tính năng tuyệt vời nhất của Shadow DOM:

-   Bộ chọn CSS từ trang bên ngoài không áp dụng bên trong thành phần của bạn.
-   Các kiểu được xác định bên trong thành phần của bạn không ảnh hưởng đến phần còn lại của trang. Chúng được xác định phạm vi đến phần tử máy chủ.

Các bộ chọn CSS được sử dụng bên trong Shadow DOM áp dụng cục bộ cho thành phần. Trên thực tế, điều này có nghĩa là chúng ta có thể sử dụng lại các tên id / lớp phổ biến mà không cần lo lắng về xung đột ở những nơi khác trên trang. Bộ chọn CSS đơn giản có nghĩa là hiệu suất tốt hơn.

Hãy xem xét # shadow-root sau để xác định một số kiểu:

Tất cả các kiểu trong ví dụ trên là cục bộ cho # shadow-root.

Bạn cũng có thể sử dụng phần tử <link> để bao gồm các biểu định kiểu trong # shadow-root cũng là cục bộ.

## The: host pseudo-class

Các `:host`cho phép bạn chọn và tạo kiểu cho phần tử lưu trữ cây bóng:

Có một điều bạn nên cẩn thận khi nói đến `:host` \- các quy tắc trong trang mẹ có mức ưu tiên cao hơn: quy tắc máy chủ lưu trữ được xác định trong phần tử. Điều này cho phép người dùng ghi đè kiểu cấp cao nhất của bạn từ bên ngoài. Cũng thế, `:host`chỉ hoạt động trong bối cảnh của gốc bóng tối, vì vậy bạn không thể sử dụng nó bên ngoài Shadow DOM.

Dạng chức năng của `:host(<selector>)`cho phép bạn nhắm mục tiêu máy chủ lưu trữ nếu nó khớp với `<selector>`. Đây là một cách tuyệt vời để thành phần của bạn đóng gói hành vi phản ứng với tương tác hoặc trạng thái của người dùng và tạo kiểu cho các nút nội bộ dựa trên máy chủ:

## Chủ đề và phần tử với lớp giả: host-context (<selector>)

Các `:host-context(<selector>)`lớp giả khớp với phần tử máy chủ nếu phần tử sau hoặc bất kỳ phần tử tổ tiên nào của nó khớp `<selector>`.

Một cách sử dụng phổ biến cho việc này là theo chủ đề. Ví dụ: nhiều người thực hiện chủ đề này bằng cách áp dụng một lớp học cho `<html>`hoặc `<body>`:

`:host-context(.lightheme)`sẽ phong cách `<fancy-tabs>`khi nó là hậu duệ của `.lightheme`:

`:host-context()`có thể hữu ích cho chủ đề nhưng một cách tiếp cận tốt hơn nữa là [tạo các móc kiểu bằng cách sử dụng các thuộc tính tùy chỉnh CSS](https://developers.google.com/web/fundamentals/web-components/shadowdom#stylehooks) .

## Tạo kiểu cho phần tử chủ của một thành phần từ bên ngoài

Bạn có thể tạo kiểu cho phần tử máy chủ của các thành phần từ bên ngoài bằng cách chỉ sử dụng tên thẻ của chúng làm bộ chọn như sau:

**Các kiểu bên ngoài có mức độ ưu tiên cao hơn các kiểu được xác định trong Shadow DOM** .

Ví dụ: nếu người dùng viết bộ chọn:

, nó sẽ ghi đè quy tắc của thành phần:

Việc tạo kiểu cho chính thành phần sẽ chỉ giúp bạn có được cho đến nay. Nhưng điều gì sẽ xảy ra nếu bạn muốn tạo kiểu cho bên trong của một thành phần? Để làm được điều đó, chúng ta cần các thuộc tính tùy chỉnh CSS.

## Tạo các móc kiểu bằng cách sử dụng các thuộc tính tùy chỉnh CSS

Người dùng có thể tinh chỉnh các kiểu nội bộ nếu tác giả của thành phần cung cấp các móc tạo kiểu bằng cách sử dụng [các thuộc tính tùy chỉnh CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) .

Ý tưởng tương tự như `<slot>`nhưng được áp dụng cho các phong cách.

Hãy xem ví dụ sau:

Bên trong Shadow DOM của nó:

Trong trường hợp này, thành phần sẽ sử dụng màu đen làm giá trị nền do người dùng cung cấp. Nếu không, nó sẽ mặc định là `#CECECE`.

Với tư cách là tác giả thành phần, bạn có trách nhiệm cho các nhà phát triển biết về các thuộc tính tùy chỉnh CSS mà họ có thể sử dụng. Hãy coi nó là một phần của giao diện công khai của thành phần của bạn.

## JavaScript khe API

API Shadow DOM cung cấp các tiện ích để làm việc với các vị trí.

## Sự kiện thay đổi vị trí

Sự kiện thay đổi vị trí kích hoạt khi các nút được phân phối của vị trí thay đổi. Ví dụ: nếu người dùng thêm / xóa con khỏi DOM nhẹ.

Để theo dõi các loại thay đổi khác đối với DOM nhẹ, bạn có thể sử dụng `MutationObserver`trong phương thức khởi tạo của phần tử của bạn. Trước đây chúng ta đã thảo luận về [nội dung của MutationObserver và cách sử dụng nó](https://blog.sessionstack.com/how-javascript-works-tracking-changes-in-the-dom-using-mutationobserver-86adc7446401) .

## Phương thức được gán ()

Có thể hữu ích khi biết những yếu tố nào được liên kết với một vị trí. Kêu gọi `slot.assignedNodes()`, cung cấp cho bạn những phần tử mà vị trí đang hiển thị. Các `{flatten: true}`tùy chọn cũng sẽ trả về nội dung dự phòng của vị trí (nếu không có nút nào đang được phân phối).

Hãy xem ví dụ sau:

`<slot name=’slot1’><p>Default content</p></slot>`

Giả sử rằng điều này nằm trong một thành phần được gọi là `<my-container>` .

Hãy cùng xem các cách sử dụng khác nhau của thành phần này và kết quả của việc gọi `assignedNodes()`:

Trong trường hợp đầu tiên, chúng tôi sẽ thêm nội dung của riêng mình vào vị trí:

Kêu gọi `assignedNodes()`sẽ cho kết quả `[<span slot=”slot1”> container text </span>]`. Lưu ý rằng kết quả là một mảng các nút.

Trong trường hợp thứ hai, chúng tôi sẽ để trống nội dung:

`<my-container> </my-container>`

Kết quả của cuộc gọi `assignedNodes()`sẽ trả về một mảng trống `[]`.

Tuy nhiên, nếu bạn vượt qua `{flatten: true}`cho cùng một phần tử, kết quả là bạn sẽ nhận được nội dung mặc định: `[<p>Default content</p>]`.

Ngoài ra, để tiếp cận một phần tử bên trong một vị trí, bạn có thể gọi `assignedNodes()`để xem vị trí thành phần nào mà phần tử của bạn được chỉ định.

## Mô hình sự kiện

Thật thú vị khi lưu ý những gì sẽ xảy ra khi một sự kiện diễn ra trong Shadow DOM nổi lên.

Mục tiêu của sự kiện được điều chỉnh để duy trì tính đóng gói được cung cấp bởi Shadow DOM. Khi một sự kiện được nhắm mục tiêu lại, có vẻ như nó đến từ chính thành phần, chứ không phải là phần tử bên trong Shadow DOM là một phần của thành phần.

Dưới đây là danh sách các sự kiện lan truyền từ Shadow DOM (có một số sự kiện thì không):

-   **Sự kiện tiêu** điểm: làm mờ, lấy nét, tiêu điểm, tiêu điểm
-   **Sự kiện chuột** : nhấp chuột, nhấp chuột, di chuột qua, trung tâm di chuột, di chuyển chuột, v.v.
-   **Sự kiện** bánh xe: bánh xe
-   **Sự kiện đầu vào** : đầu vào trước, đầu vào
-   **Sự kiện bàn phím** : keydown, keyup
-   **Sự kiện** sáng tác: sáng tác, cập nhật sáng tác, sáng tác
-   **DragEvent** : khởi động kéo, kéo, mang, thả, v.v.

## Sự kiện tùy chỉnh

Các sự kiện tùy chỉnh không lan truyền bên ngoài Shadow DOM theo mặc định. Nếu bạn muốn gửi một sự kiện tùy chỉnh và muốn nó phổ biến, bạn cần thêm `bubbles: true`và `composed: true`Như là một lựa chọn.

Hãy xem việc cử một sự kiện như vậy có thể trông như thế nào:

Hỗ trợ trình duyệt

Để phát hiện xem Shadow DOM có phải là một tính năng được hỗ trợ hay không, hãy kiểm tra sự tồn tại của tệp đính kèm:

![](https://miro.medium.com/max/700/0*k0vSOmvdDkRJzcpW)

Nói chung, Shadow DOM hoạt động theo một cách khá khác so với DOM. Chúng tôi có một ví dụ trực tiếp từ trải nghiệm của chúng tôi với thư viện SessionStack. Thư viện của chúng tôi được tích hợp vào các ứng dụng web để thu thập dữ liệu như sự kiện người dùng, dữ liệu mạng, ngoại lệ, thông báo gỡ lỗi, thay đổi DOM, v.v. và để gửi dữ liệu này đến máy chủ của chúng tôi.

Sau đó, chúng tôi xử lý dữ liệu đã thu thập để cho phép bạn phát lại các sự cố đã xảy ra trong sản phẩm của mình bằng SessionStack.  
Khó khăn phát sinh từ việc sử dụng Shadow DOM là như sau: chúng tôi phải theo dõi mọi thay đổi của DOM để có thể phát lại nó đúng cách sau này. Chúng tôi thực hiện điều này bằng cách sử dụng MutationObserver. Shadow DOM, tuy nhiên, không kích hoạt các sự kiện MutationObserver trong phạm vi toàn cầu, có nghĩa là chúng ta cần xử lý các thành phần đó theo cách khác. Chúng tôi thấy rằng ngày càng có nhiều ứng dụng web tận dụng Shadow DOM trong những ngày này, vì vậy có vẻ như công nghệ này có một tương lai tươi sáng ở phía trước.

Có một gói miễn phí nếu bạn muốn [dùng thử SessionStack](https://www.sessionstack.com/solutions/developers/?utm_source=medium&utm_medium=blog&utm_content=shadow-dom) .

![](https://miro.medium.com/max/700/0*1J8vTKKFc_fJV4Ry)

Người giới thiệu:

-   [https://developer.mozilla.org/en-US/docs/Web/Web\_Components/Using\_shadow\_DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
-   [https://developers.google.com/web/fundamentals/web-components/shadowdom](https://developers.google.com/web/fundamentals/web-components/shadowdom)
-   [https://developer.mozilla.org/en-US/docs/Web/Web\_Components/Using\_templates\_and\_slots](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots)
-   [https://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/#toc-style-host](https://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/#toc-style-host)
