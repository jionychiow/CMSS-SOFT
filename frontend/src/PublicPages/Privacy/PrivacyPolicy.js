import React from 'react';
import { Typography, Box,CardMedia } from '@mui/material';

const PrivacyPolicy = () => (
  <Box sx={{p:10}}>
    <CardMedia
                sx={{ height: 100, objectFit: 'contain', mb: 7 }}
                image="/g888.png"
                title="Logo"
                component="img"
            // sx={}
            />
    <Typography variant="h4">隐私政策</Typography>

    <Typography variant="body2">
      本隐私政策描述了当您访问我们的网站（"网站"）或从中购买商品时，我们如何收集、使用和分享您的个人信息。
    </Typography>

    <br />

    <Typography variant="h5">我们收集的个人信息</Typography>
    <Typography variant="body2">
      当您访问网站时，我们会自动收集有关您设备的某些信息，包括有关您的网络浏览器、IP地址、时区以及安装在您设备上的一些Cookie的信息。此外，当您浏览网站时，我们会收集有关您查看的各个网页或产品、哪些网站或搜索词将您引荐到本网站，以及您如何与网站互动的信息。我们将这些自动收集的信息称为"设备信息"。
    </Typography>

    <br />

    <Typography variant="h5">我们使用以下技术收集设备信息：</Typography>
    <Typography variant="body2">
      - "Cookie"是放置在您的设备或计算机上的数据文件，通常包含一个匿名唯一标识符。有关Cookie的更多信息以及如何禁用Cookie，请访问http://www.allaboutcookies.org。
    </Typography>

    <br />

    <Typography variant="h5">我们如何使用您的个人信息？</Typography>
    <Typography variant="body2">
      我们使用收集的设备信息来帮助我们筛选潜在风险和欺诈行为（特别是您的IP地址），更一般地用于改进和优化我们的网站（例如，通过生成关于客户如何浏览和与网站互动的分析，以及评估我们的营销和广告活动的成功程度）。
    </Typography>

    <br />

    <Typography variant="h5">分享您的个人信息</Typography>
    <Typography variant="body2">
      我们不会与第三方分享您的个人信息。此外，我们使用Google Analytics来帮助我们了解客户如何使用本网站——您可以在此处阅读有关Google如何使用您的个人信息的更多信息：https://www.google.com/intl/en/policies/privacy/。您也可以在此处退出Google Analytics：https://tools.google.com/dlpage/gaoptout。
    </Typography>

    <br />

    <Typography variant="h5">变更</Typography>
    <Typography variant="body2">
      我们可能会不时更新本隐私政策，以反映例如我们做法的变更或其他运营、法律或监管原因。
    </Typography>

    <br />

    <Typography variant="h5">联系我们</Typography>
    <Typography variant="body2">
      有关我们隐私做法的更多信息，如果您有任何问题，或如果您想提出投诉，请通过电子邮件联系我们的邮箱email@email.io或使用以下详细信息通过邮件联系我们：
    </Typography>

    <Typography variant="body2">
      街道名称，城市，国家
    </Typography>
  </Box>
);

export default PrivacyPolicy;