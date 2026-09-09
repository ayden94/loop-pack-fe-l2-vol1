import { expect, test } from '@playwright/test'

import { accounts } from '@/app/api/_data/auth'

import { expiredSessionCookie, parallelAccount, signIn } from './support/auth'

const productName = 'WOMAN GNRL 케이블 풀오버 [IVORY] / WBC3L05502'

test('Session lifecycle: token expires during client navigation -> header and protected page agree', async ({
  page,
  context,
  baseURL,
}, testInfo) => {
  const account = parallelAccount(testInfo.parallelIndex)
  if (baseURL === undefined) {
    throw new Error('만료 쿠키를 만들려면 baseURL이 필요합니다.')
  }
  await page.goto('/login?next=%2Fcheckout')
  await signIn(page, account.email)
  await expect(page).toHaveURL('/checkout')
  await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()
  await context.addCookies([expiredSessionCookie(account.id, baseURL)])

  await page.getByRole('link', { name: '주문 내역' }).click()

  await expect(page).toHaveURL('/login?next=%2Forders&reason=expired')
  await expect(
    page.getByRole('link', { name: '로그인', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '로그아웃' })).toHaveCount(0)
  await expect(
    page.getByRole('status').filter({ hasText: '세션이 만료되었습니다.' }),
  ).toBeVisible()
})

test('Cart ownership: logout then another account signs in -> previous products cannot become their order', async ({
  page,
}, testInfo) => {
  const first = parallelAccount(testInfo.parallelIndex)
  const second = parallelAccount((testInfo.parallelIndex + 1) % accounts.length)
  await page.goto('/login')
  await signIn(page, first.email)
  await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()
  await page.getByRole('link', { name: '상품', exact: true }).click()
  await page.getByRole('button', { name: `${productName} 장바구니` }).click()
  await expect(page.getByLabel('장바구니 1개')).toBeVisible()

  await page.getByRole('button', { name: '로그아웃' }).click()
  await page.getByRole('link', { name: '로그인', exact: true }).click()
  await signIn(page, second.email)

  await expect(page.getByText(second.name, { exact: false })).toBeVisible()
  await page.getByRole('link', { name: '주문서', exact: true }).click()
  await expect(page.getByText('장바구니가 비어 있습니다.')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('장바구니 0개')).toBeVisible()
  await expect(page.getByRole('button', { name: '주문하기' })).toHaveCount(0)
})
